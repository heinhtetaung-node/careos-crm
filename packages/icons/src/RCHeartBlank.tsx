import React, { SVGProps } from 'react';

function RCHeartBlank(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="15"
      height="13"
      viewBox="0 0 15 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0)">
        <path
          d="M5.55905 12.0491C3.63714 10.8005 3.76056 7.29763 5.84117 4.22826C7.92177 1.1589 11.1661 -0.29775 13.088 0.950805C15.0099 2.19936 14.8865 5.70225 12.8059 8.77162C10.7253 11.841 7.48096 13.315 5.55905 12.0491Z"
          fill="#e9edf5"
        />
        <path
          d="M8.76663 11.9972C10.3359 10.7659 9.98326 7.73125 7.95555 5.2168C5.92784 2.70235 3.00089 1.66189 1.43162 2.87576C-0.137652 4.10698 0.214993 7.14166 2.2427 9.65611C4.27041 12.1706 7.19736 13.211 8.76663 11.9972Z"
          fill="#e9edf5"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect
            width="14"
            height="12"
            fill="white"
            transform="translate(0.445312 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default RCHeartBlank;
