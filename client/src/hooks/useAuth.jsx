// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing auth token on app start
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
    setIsInitialized(true);
  }, []);

  const login = async (userData, authToken) => {
    // Update state first
    setUser(userData);
    setToken(authToken);
    
    // Then update localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Return a promise that resolves after state is updated
    return new Promise((resolve) => {
      // Use setTimeout to ensure state update is complete
      setTimeout(() => {
        resolve({ user: userData, token: authToken });
      }, 0);
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Enhanced authentication state management hook
export const useAuthState = () => {
  const [authState, setAuthState] = useState({
    isLoading: false,
    error: null,
    success: null
  });

  const setLoading = (loading) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error) => {
    setAuthState(prev => ({ ...prev, error, success: null }));
  };

  const setSuccess = (success) => {
    setAuthState(prev => ({ ...prev, success, error: null }));
  };

  const clearState = () => {
    setAuthState({ isLoading: false, error: null, success: null });
  };

  return {
    ...authState,
    setLoading,
    setError,
    setSuccess,
    clearState
  };
};