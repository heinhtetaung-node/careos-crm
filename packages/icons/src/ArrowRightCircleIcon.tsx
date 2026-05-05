import React from 'react';

import IconProps from './interface';

function ArrowRightCircleIcon({ fillColor = '#CEDCDF', variant }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" fill={fillColor} />
      <g filter="url(#filter0_d_5655_212963)">
        <rect x="-16" y="-16" width="300" height="98" rx="10" fill="white" />
        <path
          d="M10.5002 10.9342L8.58346 12.851C8.25012 13.1843 8.25012 13.6842 8.58346 14.0175C8.91679 14.3509 9.41671 14.3509 9.75004 14.0175L13.0834 10.6842C13.4167 10.3509 13.4167 9.85095 13.0834 9.51762L9.75004 6.18429C9.41671 5.85095 8.91679 5.85095 8.58346 6.18429C8.25012 6.51762 8.25012 7.01754 8.58346 7.35087L10.5002 9.26758H2.50008C2.00008 9.26758 1.66675 9.60091 1.66675 10.1009C1.66675 10.6009 2.00008 10.9342 2.50008 10.9342H10.5002ZM10.0001 1.76758C6.83341 1.76758 3.91675 3.51756 2.50008 6.43422C2.33341 6.85089 2.5 7.35093 2.83333 7.5176C3.16667 7.68427 3.75012 7.5176 4.00012 7.10093C5.58346 3.7676 9.58342 2.35087 12.9167 4.01754C16.2501 5.60087 17.6667 9.60093 16 12.9343C14.4167 16.2676 10.4167 17.6842 7.08341 16.0176C5.75008 15.3509 4.66679 14.2676 4.00012 13.0176C3.83346 12.6009 3.25 12.4342 2.83333 12.6009C2.41667 12.7676 2.25008 13.351 2.50008 13.6843C4.58341 17.7676 9.58333 19.5176 13.6667 17.4343C17.75 15.351 19.5 10.3509 17.4167 6.2676C16.0833 3.60093 13.1667 1.76758 10.0001 1.76758Z"
          fill="#005098"
        />
        <circle
          cx="16.5"
          cy="3.5"
          r="3.5"
          fill={variant === 'new' ? '#EA4548' : '#aeaeae'}
          stroke="white"
          strokeWidth="2"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_5655_212963"
          x="-46"
          y="-58"
          width="372"
          height="170"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="15" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.165799 0 0 0 0 0.19289 0 0 0 0 0.795833 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_5655_212963"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_5655_212963"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default ArrowRightCircleIcon;
