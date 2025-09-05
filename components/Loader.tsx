import React from 'react';
import { PencilIcon } from './icons/PencilIcon';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-amber-700">
      <PencilIcon className="w-16 h-16 animate-spin" style={{ animationDuration: '2s' }}/>
      <p className="mt-4 text-xl font-bold">The animals are preparing your lesson...</p>
    </div>
  );
};

export default Loader;
