import clsx from 'clsx';
import React from 'react';

import IconProps from './interface';

export default function BellIcon({
  className,
  fillColor = '#005098',
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="20"
      height="20"
      viewBox="0 0 256 256"
      xmlSpace="preserve"
      fill={fillColor}
      className={clsx(className)}
    >
      <defs />
      <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
        <path
          d="M 73.844 53.014 v -24.17 C 73.844 12.914 60.93 0 45 0 h 0 C 29.07 0 16.156 12.914 16.156 28.844 v 24.17 c 0 3.061 -1.34 5.969 -3.668 7.957 l 0 0 c -2.328 1.988 -3.668 4.896 -3.668 7.957 v 0 c 0 1.839 1.491 3.329 3.329 3.329 h 65.7 c 1.839 0 3.329 -1.491 3.329 -3.329 v 0 c 0 -3.061 -1.34 -5.969 -3.668 -7.957 l 0 0 C 75.184 58.982 73.844 56.075 73.844 53.014 z"
          transform=" matrix(1 0 0 1 0 0) "
          strokeLinecap="round"
        />
        <path
          d="M 57.733 77.181 c 0 0.028 0.004 0.054 0.004 0.082 C 57.737 84.297 52.035 90 45 90 s -12.737 -5.703 -12.737 -12.737 c 0 -0.028 0.004 -0.054 0.004 -0.082 H 57.733 z"
          transform=" matrix(1 0 0 1 0 0) "
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
