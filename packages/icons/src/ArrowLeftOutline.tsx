import clsx from 'clsx';
import React from 'react';

import IconProps from './interface';

function ArrowLeftOutline({ className }: IconProps) {
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
        d="M14.7004 6.72L8.82039 12.6C8.26039 13.16 8.26039 14 8.82039 14.56L14.7004 20.58C15.2604 21.14 16.1004 21.14 16.6604 20.58C17.2204 20.02 17.2204 19.18 16.6604 18.62L11.7604 13.72L16.8004 8.68C17.3604 8.12 17.3604 7.14 16.8004 6.72C16.1004 6.16 15.2604 6.16 14.7004 6.72Z"
        fill="currentcolor"
      />
      <path
        d="M1.66948e-07 14C7.51268e-08 21.7 6.3 28 14 28C21.7 28 28 21.7 28 14C28 6.3 21.7 -3.55593e-06 14 -3.64775e-06C6.3 -3.73957e-06 2.5877e-07 6.3 1.66948e-07 14ZM25.2 14C25.2 20.16 20.16 25.2 14 25.2C7.84 25.2 2.8 20.16 2.8 14C2.8 7.84 7.84 2.8 14 2.8C20.16 2.8 25.2 7.84 25.2 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ArrowLeftOutline;
