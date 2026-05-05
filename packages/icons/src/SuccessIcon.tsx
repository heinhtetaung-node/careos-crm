import React from 'react';

import IconProps from './interface';

function SuccessIcon({
  bgFillColor = '#dff4db',
  fillColor = '#5fb15c',
  ...props
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="76"
      height="76"
      viewBox="0 0 76 76"
      {...props}
    >
      <rect width="76" height="76" rx="38" fill={bgFillColor}></rect>
      <path
        d="M45.281,7.782a2.935,2.935,0,0,0-4.168,0L19.248,29.677l-9.186-9.216a3,3,0,1,0-4.168,4.314l11.27,11.27a2.935,2.935,0,0,0,4.168,0L45.281,12.1a2.935,2.935,0,0,0,0-4.314Z"
        transform="translate(12.022 16.086)"
        fill={fillColor}
      ></path>
    </svg>
  );
}

export default SuccessIcon;
