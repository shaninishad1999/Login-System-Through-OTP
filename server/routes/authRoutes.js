const express = require('express');
const { body } = require('express-validator');
const {
  register,
  verifyOTP,
  resendOTP,
  login,
} = require('../controllers/authController');

const router = express.Router();

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.path}`, {
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// OTP validation - accept either userId or email
const otpValidation = [
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits'),
  // Custom validation for userId OR email
  body().custom((value, { req }) => {
    if (!req.body.userId && !req.body.email) {
      throw new Error('Either User ID or Email is required');
    }
    return true;
  })
];

const resendOTPValidation = [
  // Custom validation for userId OR email
  body().custom((value, { req }) => {
    if (!req.body.userId && !req.body.email) {
      throw new Error('Either User ID or Email is required');
    }
    return true;
  })
];

// Routes
router.post('/register', registerValidation, register);
router.post('/verify-otp', otpValidation, verifyOTP);
router.post('/resend-otp', resendOTPValidation, resendOTP);
router.post('/login', loginValidation, login);

module.exports = router;