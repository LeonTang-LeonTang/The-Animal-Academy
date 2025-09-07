import React, { useState, useEffect } from 'react';
import { PencilIcon } from './icons/PencilIcon';

const messages = [
  "The animals are gathering their notes...",
  "Professor Owl is drafting the explanation...",
  "The capybaras are sketching the comics...",
  "The diligent bees are organizing the flashcards...",
  "Almost there, just putting it all together!",
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-amber-700">
      <PencilIcon className="w-16 h-16 animate-spin" style={{ animationDuration: '2s' }}/>
      <p className="mt-4 text-xl font-bold text-center transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;
