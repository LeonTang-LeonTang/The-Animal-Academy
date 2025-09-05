import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg w-full text-center" role="alert">
      <p className="font-bold text-2xl">An Error Occurred</p>
      <p className="text-lg mt-2">{message}</p>
    </div>
  );
};

export default ErrorDisplay;