import React from 'react';

export const DislikeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19 15V4H15v11h4zm-7.4-12c-.5 0-.9.4-.9.9v7.5c0 .5.4 1 .9 1H18l2.1-4.2c.2-.4.6-.6 1-.6h1V4l-3.4 7.6c-.3.8-1 1.3-1.8 1.3h-.1c-.6 0-1.2-.3-1.5-.8L13.8 4h-2.3c-.5 0-.9.4-.9.9V6c0 .5-.4 1-.9 1h-.1z" />
  </svg>
);