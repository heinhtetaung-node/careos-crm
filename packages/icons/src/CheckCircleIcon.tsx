import React from 'react';
import IconProps from './interface';

function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={className}
    >
      <title />
      <g id="icomoon-ignore" />
      <path
        fill="currentColor"
        d="M1001.472 165.888c-28.672-28.672-73.728-28.672-102.4 0 0 0 0 0 0 0l-544.768 542.72-227.328-229.376c-30.72-28.672-77.824-28.672-106.496 2.048-28.672 28.672-28.672 75.776 0 104.448 0 0 0 0 2.048 2.048l280.576 280.576c28.672 28.672 73.728 28.672 102.4 0 0 0 0 0 0 0l593.92-593.92c28.672-26.624 30.72-73.728 4.096-102.4 0-4.096-2.048-6.144-2.048-6.144v0z"
      />
    </svg>
  );
}

export default CheckCircleIcon;
