// src/components/auth/AuthLayout.jsx
import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import OTPVerification from './OTPVerification';
import LoginForm from './LoginForm';
import ProgressIndicator from './ProgressIndicator';
import toast from 'react-hot-toast';
const AuthLayout = () => {
  const [currentStep, setCurrentStep] = useState('register'); // 'register', 'otp', 'login'
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState({});

  const handleRegistrationSuccess = (email, data) => {
    setUserEmail(email);
    setUserData(data);
    setCurrentStep('otp');
  };

  const handleOTPSuccess = () => {
    setCurrentStep('login');
  };

const handleLoginSuccess = () => {
  console.log('Login successful!');
  
  toast.success('Login successful!', {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: 'white',
    },
    icon: '🎉',
  });
};

  const goToRegister = () => {
    setCurrentStep('register');
    setUserEmail('');
    setUserData({});
  };

  const goToLogin = () => {
    setCurrentStep('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} />

        {/* Page Content */}
        <div className="flex justify-center">
          {currentStep === 'register' && (
            <RegisterForm 
              onSuccess={handleRegistrationSuccess}
              onGoToLogin={goToLogin}
            />
          )}
          {currentStep === 'otp' && (
            <OTPVerification 
              email={userEmail}
              onSuccess={handleOTPSuccess}
              onGoBack={goToRegister}
            />
          )}
          {currentStep === 'login' && (
            <LoginForm 
              email={userEmail}
              onSuccess={handleLoginSuccess}
              onGoToRegister={goToRegister}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;