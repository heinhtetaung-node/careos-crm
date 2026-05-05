import React, { SVGProps } from 'react';

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="11"
      height="16"
      viewBox="0 0 11 16"
      fill="#005098"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3.84962 7.92381L9.62406 2.59048C10.2657 1.98095 10.2657 1.06667 9.62406 0.457143C8.98246 -0.152381 8.02005 -0.152381 7.37845 0.457143L0.481203 6.85714C-0.160401 7.46667 -0.160401 8.38095 0.481203 8.99048L7.21804 15.5429C7.85965 16.1524 8.82205 16.1524 9.46366 15.5429C10.1053 14.9333 10.1053 14.019 9.46366 13.4095L3.84962 7.92381Z" />
    </svg>
  );
}

export default ArrowLeftIcon;
