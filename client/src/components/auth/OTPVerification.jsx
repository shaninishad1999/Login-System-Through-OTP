// src/components/auth/OTPVerification.jsx
import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { verifyOTP, resendOTP } from '../../services/authService';

const OTPVerification = ({ email, onSuccess, onGoBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const validateOTP = () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;
    
    setLoading(true);
    
    try {
      await verifyOTP(email, otp);
      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setResendLoading(true);
    
    try {
      await resendOTP(email);
      setResendTimer(60); // 60 seconds cooldown
      setError('');
      alert('OTP resent successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-blue-600 font-medium break-all">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000000"
              maxLength="6"
              autoComplete="one-time-code"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={otp.length !== 6}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            Verify OTP
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || resendTimer > 0}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>
          
          <button
            onClick={onGoBack}
            className="flex items-center justify-center w-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;