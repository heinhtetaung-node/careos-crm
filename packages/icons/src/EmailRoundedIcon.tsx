import React from 'react';

import IconProps from './interface';

function EmailRounded({ className, fillColor }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill={fillColor}
      className={className}
    >
      <path
        d="M20.5 4H4.5C3.4 4 2.5 4.9 2.5 6V18C2.5 19.1 3.4 20 4.5 20H20.5C21.6 20 22.5 19.1 22.5 18V6C22.5 4.9 21.6 4 20.5 4ZM20.1 8.25L13.56 12.34C12.91 12.75 12.09 12.75 11.44 12.34L4.9 8.25C4.65 8.09 4.5 7.82 4.5 7.53C4.5 6.86 5.23 6.46 5.8 6.81L12.5 11L19.2 6.81C19.77 6.46 20.5 6.86 20.5 7.53C20.5 7.82 20.35 8.09 20.1 8.25Z"
        fill="white"
      />
    </svg>
  );
}

export default EmailRounded;
