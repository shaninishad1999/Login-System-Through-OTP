// src/App.jsx
import React from 'react';
import AuthLayout from './components/auth/AuthLayout';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Main App Content
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
     
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
     
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {isAuthenticated ? <Dashboard /> : <AuthLayout />}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
};

export default App;