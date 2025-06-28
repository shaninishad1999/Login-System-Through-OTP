// src/services/authService.js

// API base URL - replace with your actual API endpoint
const API_BASE_URL ='http://localhost:5000/api/auth';

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await response.json();
    
  } catch (error) {
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

// Option 1: Update to use email (recommended)
export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }), // Now backend accepts email
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OTP verification failed');
    }
    
    return await response.json();
    
  } catch (error) {
    throw new Error(error.message || 'OTP verification failed');
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }), // Send email instead of userId
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to resend OTP');
    }
    
    return await response.json();
    
  } catch (error) {
    throw new Error(error.message || 'Failed to resend OTP');
  }
};

// Option 2: If you want to use userId, store it after registration
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store userId for later use
    localStorage.setItem('userId', data.userId);
    
    return data;
    
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Then modify verifyOTP to use userId
export const verifyOTPWithUserId = async (otp) => {
  try {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User ID not found. Please register again.');
    }
    
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'OTP verification failed');
    }
    
    const data = await response.json();
    
    // Clear userId after successful verification
    localStorage.removeItem('userId');
    
    return data;
    
  } catch (error) {
    throw new Error(error.message || 'OTP verification failed');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store the token in localStorage if login is successful
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
    
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    // Clear stored data regardless of API response
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }
    
    return await response.json();
    
  } catch (error) {
    // Even if API call fails, we've cleared local storage
    throw new Error(error.message || 'Logout failed');
  }
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    return null;
  }
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
};