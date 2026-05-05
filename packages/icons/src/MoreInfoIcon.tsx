import React from 'react';
import IconProps from './interface';

function MoreInfoIcon({ className, fillColor = 'white' }: Readonly<IconProps>) {
  return (
    <svg
      className={className}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <svg
        width="18"
        height="22"
        viewBox="0 0 16 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 8H6C6.6 8 7 7.6 7 7C7 6.4 6.6 6 6 6H5C4.4 6 4 6.4 4 7C4 7.6 4.4 8 5 8ZM5 10C4.4 10 4 10.4 4 11C4 11.6 4.4 12 5 12H11C11.6 12 12 11.6 12 11C12 10.4 11.6 10 11 10H5ZM16 7C16 6.9 16 6.80007 15.9 6.70007V6.59998C15.9 6.49998 15.8 6.40005 15.7 6.30005L9.70001 0.300049C9.60001 0.200049 9.50002 0.199976 9.40002 0.0999756H9.29999C9.19999 -2.44156e-05 9.1 0 9 0H3C1.3 0 0 1.3 0 3V17C0 18.7 1.3 20 3 20H13C14.7 20 16 18.7 16 17V7ZM10 3.40002L12.6 6H11C10.4 6 10 5.6 10 5V3.40002ZM14 17C14 17.6 13.6 18 13 18H3C2.4 18 2 17.6 2 17V3C2 2.4 2.4 2 3 2H8V5C8 6.7 9.3 8 11 8H14V17ZM11 14H5C4.4 14 4 14.4 4 15C4 15.6 4.4 16 5 16H11C11.6 16 12 15.6 12 15C12 14.4 11.5 14 11 14Z"
          fill={fillColor}
        ></path>
      </svg>
    </svg>
  );
}

export default MoreInfoIcon;
