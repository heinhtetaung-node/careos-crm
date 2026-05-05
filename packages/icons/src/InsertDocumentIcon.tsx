import React from 'react';
import IconProps from './interface';

function InsertDocumentIcon({
  className,
  fillColor = 'currentcolor',
}: Readonly<IconProps>) {
  return (
    <svg
      width="35"
      height="40"
      viewBox="0 0 25 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.5 2C5.4 2 4.51 2.9 4.51 4L4.5 20C4.5 21.1 5.39 22 6.49 22H18.5C19.6 22 20.5 21.1 20.5 20V8.83C20.5 8.3 20.29 7.79 19.91 7.42L15.08 2.59C14.71 2.21 14.2 2 13.67 2H6.5ZM13.5 8V3.5L19 9H14.5C13.95 9 13.5 8.55 13.5 8Z"
        fill={fillColor}
      />
    </svg>
  );
}

export default InsertDocumentIcon;
