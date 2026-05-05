import clsx from 'clsx';
import React from 'react';

import IconProps from './interface';

function ArrowRightOutline({ className }: IconProps) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(className)}
    >
      <path
        d="M13.2996 21.28L19.1796 15.4C19.7396 14.84 19.7396 14 19.1796 13.44L13.2996 7.42C12.7396 6.86 11.8996 6.86 11.3396 7.42C10.7796 7.98 10.7796 8.82 11.3396 9.38L16.2396 14.28L11.1996 19.32C10.6396 19.88 10.6396 20.86 11.1996 21.28C11.8996 21.84 12.7396 21.84 13.2996 21.28Z"
        fill="currentColor"
      />
      <path
        d="M28 14C28 6.3 21.7 -2.75382e-07 14 -6.1196e-07C6.3 -9.48537e-07 -4.09008e-06 6.3 -4.42666e-06 14C-4.76323e-06 21.7 6.3 28 14 28C21.7 28 28 21.7 28 14ZM2.79999 14C2.8 7.84 7.84 2.8 14 2.8C20.16 2.8 25.2 7.84 25.2 14C25.2 20.16 20.16 25.2 14 25.2C7.84 25.2 2.79999 20.16 2.79999 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ArrowRightOutline;
