import React from 'react';
import IconProps from './interface';

function WarningIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle opacity="0.2" cx="30" cy="30" r="30" fill="#F78F1E" />
      <path
        d="M30.8333 38.332C28.3333 38.332 26.6666 39.9987 26.6666 42.4987C26.6666 44.9987 28.3333 46.6654 30.8333 46.6654C33.3333 46.6654 35 44.9987 35 42.4987C35 39.9987 32.9166 38.332 30.8333 38.332ZM30.8333 13.332C28.3333 13.332 26.6666 14.9987 26.6666 17.4987V29.9987C26.6666 32.4987 28.3333 34.1654 30.8333 34.1654C33.3333 34.1654 35 32.4987 35 29.9987V17.4987C35 14.9987 32.9166 13.332 30.8333 13.332Z"
        fill="#F78F1E"
      />
    </svg>
  );
}

export default WarningIcon;
