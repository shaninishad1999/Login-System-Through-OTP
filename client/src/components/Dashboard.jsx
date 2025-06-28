// src/components/Dashboard.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Debug: Console log the user object
  console.log('User object in Dashboard:', user);
  console.log('User verified status:', user?.verified);
  console.log('User isVerified status:', user?.isVerified);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your E-commerce Store! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Hello, <span className="font-semibold text-blue-600">{user?.name}</span>!
            You have successfully logged in.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Account Details:</h2>
            <p className="text-blue-700">Email: {user?.email}</p>
            {/* Try both properties */}
            <p className="text-blue-700">
              Status: {(user?.verified || user?.isVerified) ? '✅ Verified' : '❌ Not Verified'}
            </p>
            
            {/* Debug information */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-left">
              <p><strong>Debug Info:</strong></p>
             
              <p>Full user object: {JSON.stringify(user, null, 2)}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;