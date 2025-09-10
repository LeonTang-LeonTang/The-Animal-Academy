import React from 'react';

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M5.5 5.5A.5.5 0 016 5h8a.5.5 0 01.5.5v8a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-8z" />
  </svg>
);