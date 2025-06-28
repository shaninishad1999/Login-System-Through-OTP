// src/components/auth/ProgressIndicator.jsx
import React from 'react';

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { key: 'register', number: 1, label: 'Register' },
    { key: 'otp', number: 2, label: 'Verify' },
    { key: 'login', number: 3, label: 'Login' }
  ];

  const getStepStatus = (stepKey) => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const stepIndex = steps.findIndex(step => step.key === stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const getConnectorClasses = (stepKey) => {
    const status = getStepStatus(stepKey);
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-300';
  };

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${getStepClasses(getStepStatus(step.key))}`}>
                {getStepStatus(step.key) === 'completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                getStepStatus(step.key) === 'active' ? 'text-blue-600' : 
                getStepStatus(step.key) === 'completed' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 transition-all duration-300 ${getConnectorClasses(steps[index + 1].key)}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;