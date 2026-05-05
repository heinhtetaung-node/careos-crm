import React from 'react';
import IconProps from './interface';
import clsx from 'clsx';

function MoreVerticalIcon({
  className,
  fillColor = '#005098',
}: Readonly<IconProps>) {
  return (
    <svg
      className={clsx(className, 'h-7 w-7')}
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="MoreVertIcon"
    >
      <path
        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"
        fill={fillColor}
      ></path>
    </svg>
  );
}

export default MoreVerticalIcon;
