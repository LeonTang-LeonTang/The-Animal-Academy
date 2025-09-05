import React from 'react';

export const ConceptIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M4 2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4.18c-.41 1.16-1.51 2-2.82 2s-2.4-.84-2.82-2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm10 14.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 4c-3.03 0-5.5 2.47-5.5 5.5 0 2.05 1.13 3.84 2.81 4.79.2.11.39.21.59.29V16h4v-1.42c.2-.08.39-.18.59-.29C16.37 13.34 17.5 11.55 17.5 9.5 17.5 6.47 15.03 4 12 4z"/>
  </svg>
);