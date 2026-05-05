import clsx from 'clsx';
import IconProps from './interface';
import React from 'react';

export default function FilterIcon({
  className,
  fillColor = '#005098',
  ...rest
}: IconProps) {
  return (
    <svg
      className={clsx(className, 'w-5 h-5')}
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="FilterAltIcon"
      fill={fillColor}
      {...rest}
    >
      <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61"></path>
    </svg>
  );
}
