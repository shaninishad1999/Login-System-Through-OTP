// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

export default LoadingSpinner;