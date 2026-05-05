import React from 'react';
import IconProps from './interface';

function ViewDocumentIcon({
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
        d="M19.5 3H15.32C14.9 1.84 13.8 1 12.5 1C11.2 1 10.1 1.84 9.68 3H5.5C4.4 3 3.5 3.9 3.5 5V19C3.5 20.1 4.4 21 5.5 21H19.5C20.6 21 21.5 20.1 21.5 19V5C21.5 3.9 20.6 3 19.5 3ZM12.5 3C13.05 3 13.5 3.45 13.5 4C13.5 4.55 13.05 5 12.5 5C11.95 5 11.5 4.55 11.5 4C11.5 3.45 11.95 3 12.5 3ZM13.5 17H8.5C7.95 17 7.5 16.55 7.5 16C7.5 15.45 7.95 15 8.5 15H13.5C14.05 15 14.5 15.45 14.5 16C14.5 16.55 14.05 17 13.5 17ZM16.5 13H8.5C7.95 13 7.5 12.55 7.5 12C7.5 11.45 7.95 11 8.5 11H16.5C17.05 11 17.5 11.45 17.5 12C17.5 12.55 17.05 13 16.5 13ZM16.5 9H8.5C7.95 9 7.5 8.55 7.5 8C7.5 7.45 7.95 7 8.5 7H16.5C17.05 7 17.5 7.45 17.5 8C17.5 8.55 17.05 9 16.5 9Z"
        fill={fillColor}
      />
    </svg>
  );
}

export default ViewDocumentIcon;
