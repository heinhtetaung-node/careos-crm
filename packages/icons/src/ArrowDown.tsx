import React, { SVGProps } from 'react';

export default function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="6"
      viewBox="0 0 11 6"
      fill="#005098"
      {...props}
    >
      <path
        d="M17,9.17a1,1,0,0,0-1.41,0L12,12.71,8.46,9.17a1,1,0,1,0-1.41,1.42l4.24,4.24a1,1,0,0,0,1.42,0L17,10.59a1,1,0,0,0,0-1.42Z"
        transform="translate(-6.754 -8.879)"
      />
    </svg>
  );
}
