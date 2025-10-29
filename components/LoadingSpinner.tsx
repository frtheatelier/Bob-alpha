
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
      <p className="text-stone-700 text-lg tracking-wider">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
