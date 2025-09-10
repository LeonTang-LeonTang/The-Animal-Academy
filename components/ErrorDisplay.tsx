import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const { t } = useLocalization();
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg w-full text-center" role="alert">
      <p className="font-bold text-2xl">{t('errorTitle')}</p>
      <p className="text-lg mt-2">{message}</p>
    </div>
  );
};

export default ErrorDisplay;