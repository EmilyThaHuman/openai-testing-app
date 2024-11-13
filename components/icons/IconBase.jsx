import React from 'react';

export const IconBase = ({ children, viewBox = "0 0 32 32", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    width="1em"
    height="1em"
    fill="currentColor"
    {...props}
  >
    {children}
  </svg>
); 