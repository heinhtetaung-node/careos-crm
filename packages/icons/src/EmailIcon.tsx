import React from 'react';

import IconProps from './interface';

export default function EmailIcon({
  fillColor = '#005098',
  variant,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
    >
      <path
        d="M13.6,18.03H4a2.4,2.4,0,0,1-2.4-2.4V9.23a.8.8,0,1,0-1.6,0v6.4a4,4,0,0,0,4,4h9.6a.8.8,0,1,0,0-1.6Zm3.2-14.4H5.6a2.4,2.4,0,0,0-2.4,2.4v8a2.4,2.4,0,0,0,2.4,2.4H16.8a2.4,2.4,0,0,0,2.4-2.4v-8a2.4,2.4,0,0,0-2.4-2.4Zm-.328,1.6-4.7,4.7a.8.8,0,0,1-1.136,0l-4.7-4.7Zm1.128,8.8a.8.8,0,0,1-.8.8H5.6a.8.8,0,0,1-.8-.8v-7.7l4.7,4.7a2.4,2.4,0,0,0,3.392,0l4.7-4.7Z"
        transform="translate(0 -3.63)"
        fill={fillColor}
      />
      <circle
        cx="17.5"
        cy="2.5"
        r="3.5"
        fill={variant === 'new' ? '#EA4548' : '#aeaeae'}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}
