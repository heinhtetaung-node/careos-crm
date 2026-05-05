import IconProps from './interface';
import React from 'react';

export default function EnvelopeIcon({ onClick, ...rest }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      {...rest}
    >
      <path
        d="M19 4H5C3.3 4 2 5.3 2 7V17C2 18.7 3.3 20 5 20H19C20.7 20 22 18.7 22 17V7C22 5.4 20.7 4 19 4ZM5 6H19C19.6 6 20 6.4 20 7L12 11.8999L4 7C4 6.5 4.4 6 5 6ZM20 17C20 17.6 19.6 18 19 18H5C4.4 18 4 17.6 4 17V9.29993L11.5 13.8999C11.8 14.0999 12.2 14.0999 12.5 13.8999L20 9.29993V17Z"
        fill="currentColor"
      />
    </svg>
  );
}
