const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendOTPEmail } = require('../config/email');
const { generateOTP, getOTPExpiration } = require('../utils/otpGenerator');

// Temporary storage for pending registrations (in production, use Redis)
const pendingRegistrations = new Map();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'sdfasdfsadf', {
    expiresIn: '7d',
  });
};

// Register user (only send OTP, don't create user yet)
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    // Store user data temporarily (not in database yet)
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    pendingRegistrations.set(registrationId, {
      name,
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpires,
      createdAt: new Date()
    });

    // Clean up expired registrations (optional cleanup)
    cleanupExpiredRegistrations();

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message: 'Registration initiated. Please check your email for OTP verification.',
      registrationId: registrationId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify OTP and create user
const verifyOTP = async (req, res) => {
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  try {
    const { registrationId, email, otp } = req.body;

    // Debug logging
    console.log('Verify OTP Request:', { registrationId, email, otp, body: req.body });

    // Validate input
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    if (!registrationId && !email) {
      return res.status(400).json({ message: 'Either Registration ID or Email is required' });
    }

    let pendingRegistration;

    // Find pending registration by registrationId or email
    if (registrationId) {
      pendingRegistration = pendingRegistrations.get(registrationId);
    } else if (email) {
      // Search by email in pending registrations
      for (const [key, value] of pendingRegistrations.entries()) {
        if (value.email === email.toLowerCase().trim()) {
          pendingRegistration = value;
          pendingRegistration.registrationId = key;
          break;
        }
      }
    }

    if (!pendingRegistration) {
      return res.status(404).json({ message: 'Registration not found or expired. Please register again.' });
    }

    // Check if OTP is valid
    if (!pendingRegistration.otp || pendingRegistration.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (pendingRegistration.otpExpires < new Date()) {
      // Clean up expired registration
      if (pendingRegistration.registrationId) {
        pendingRegistrations.delete(pendingRegistration.registrationId);
      }
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    // Check again if user exists (in case someone registered with same email during OTP process)
    const existingUser = await User.findOne({ email: pendingRegistration.email });
    if (existingUser) {
      // Clean up pending registration
      if (pendingRegistration.registrationId) {
        pendingRegistrations.delete(pendingRegistration.registrationId);
      }
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user in database now
    const user = new User({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      isVerified: true, // Mark as verified since OTP is confirmed
    });

    await user.save();

    // Clean up pending registration
    if (registrationId) {
      pendingRegistrations.delete(registrationId);
    } else if (pendingRegistration.registrationId) {
      pendingRegistrations.delete(pendingRegistration.registrationId);
    }

    res.status(200).json({
      message: 'Email verified successfully and account created. You can now login.',
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { registrationId, email } = req.body;

    // Validate input
    if (!registrationId && !email) {
      return res.status(400).json({ message: 'Either Registration ID or Email is required' });
    }

    let pendingRegistration;

    // Find pending registration by registrationId or email
    if (registrationId) {
      pendingRegistration = pendingRegistrations.get(registrationId);
    } else if (email) {
      // Search by email in pending registrations
      for (const [key, value] of pendingRegistrations.entries()) {
        if (value.email === email.toLowerCase().trim()) {
          pendingRegistration = value;
          pendingRegistration.registrationId = key;
          break;
        }
      }
    }

    if (!pendingRegistration) {
      return res.status(404).json({ message: 'Registration not found or expired. Please register again.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiration();

    // Update the pending registration with new OTP
    pendingRegistration.otp = otp;
    pendingRegistration.otpExpires = otpExpires;

    // Update in the map
    const keyToUpdate = registrationId || pendingRegistration.registrationId;
    pendingRegistrations.set(keyToUpdate, pendingRegistration);

    // Send new OTP email
    await sendOTPEmail(pendingRegistration.email, otp, pendingRegistration.name);

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
};

// Login user (unchanged)
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified, // Add this field
        
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Utility function to clean up expired registrations
const cleanupExpiredRegistrations = () => {
  const now = new Date();
  for (const [key, value] of pendingRegistrations.entries()) {
    if (value.otpExpires < now) {
      pendingRegistrations.delete(key);
    }
  }
};

// Optional: Set up periodic cleanup (run every 10 minutes)
setInterval(cleanupExpiredRegistrations, 10 * 60 * 1000);

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
};