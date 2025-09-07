import React from 'react';

export const LikeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M5 9v11h4V9H5zm14.4-3c.5 0 .9.4.9.9v7.5c0 .5-.4 1-.9 1H12l-2.1 4.2c-.2.4-.6.6-1 .6H8v-11l3.4-7.6c.3-.8 1-1.3 1.8-1.3h.1c.6 0 1.2.3 1.5.8L16.2 9h2.3c.5 0 .9-.4.9-.9V6c0-.5.4-1 .9-1h.1z" />
  </svg>
);