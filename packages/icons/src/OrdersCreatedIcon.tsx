import React from 'react';
import IconProps from './interface';

export default function OrdersCartIcon({
  className,
  fillColor = '#005098',
}: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.33333 1.33334H3.33333L4.85333 9.71334C4.94667 10.2333 5.4 10.6667 5.93333 10.6667H12.4C12.9333 10.6667 13.3867 10.2333 13.48 9.71334L14.6667 4H4"
        stroke={fillColor}
        strokeWidth="1.3333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="13.3333"
        r="1"
        stroke={fillColor}
        strokeWidth="1.3333"
      />
      <circle
        cx="12"
        cy="13.3333"
        r="1"
        stroke={fillColor}
        strokeWidth="1.3333"
      />
    </svg>
  );
}
