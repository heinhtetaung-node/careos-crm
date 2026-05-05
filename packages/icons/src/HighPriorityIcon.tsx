import IconProps from './interface';
import React from 'react';

export default function HighPriorityIcon({
  fillColor = '#005098',
  ...props
}: Readonly<IconProps>) {
  return (
    <svg
      width="12"
      height="24"
      viewBox="0 0 12 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 15.36C5.33726 15.36 4.8 14.8228 4.8 14.16V6.00005C4.8 5.33731 5.33726 4.80005 6 4.80005C6.66274 4.80005 7.2 5.33731 7.2 6.00005V14.16C7.2 14.8228 6.66274 15.36 6 15.36Z"
        fill={fillColor}
      />
      <path
        d="M4.98176 16.7423C5.54412 16.1799 6.45588 16.1799 7.01823 16.7423C7.58059 17.3046 7.58059 18.2164 7.01823 18.7787C6.45588 19.3411 5.54412 19.3411 4.98176 18.7787C4.41941 18.2164 4.41941 17.3046 4.98176 16.7423Z"
        fill={fillColor}
      />
    </svg>
  );
}
