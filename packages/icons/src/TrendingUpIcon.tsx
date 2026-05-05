import React from 'react';
import IconProps from './interface';

export default function TrendingUpIcon({
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
        d="M14.4667 4.86669C14.2 4.60002 13.8 4.60002 13.5334 4.86669L9.33337 9.06669L6.46671 6.20002C6.20004 5.93335 5.80004 5.93335 5.53337 6.20002L1.53337 10.2C1.26671 10.4667 1.26671 10.8667 1.53337 11.1334C1.80004 11.4 2.20004 11.4 2.46671 11.1334L6.00004 7.60002L8.86671 10.4667C9.13337 10.7334 9.53337 10.7334 9.80004 10.4667L14.4667 5.80002C14.7334 5.53335 14.7334 5.13335 14.4667 4.86669Z"
        fill={fillColor}
      />
    </svg>
  );
}

