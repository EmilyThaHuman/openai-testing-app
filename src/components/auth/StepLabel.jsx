import React from 'react';

const StepLabel = ({ children, isActive, isCompleted }) => {
  return (
    <div
      className={`flex items-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
    >
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
          isActive
            ? 'border-blue-600'
            : isCompleted
              ? 'border-green-600'
              : 'border-gray-300'
        }`}
      >
        {isCompleted ? (
          <span className="text-green-600">✓</span>
        ) : isActive ? (
          <span className="text-blue-600">{children}</span>
        ) : (
          <span className="text-gray-500">{children}</span>
        )}
      </div>
      <span className="ml-2">{children}</span>
    </div>
  );
};

export default StepLabel;
