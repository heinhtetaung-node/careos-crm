import React from 'react';
import IconProps from './interface';

function CareIcon({ className, fillColor = 'none' }: Readonly<IconProps>) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.3638 6.44819C19.2541 7.70478 19.1278 11.2076 17.0842 14.2733C15.0406 17.3391 11.8534 18.8055 9.9619 17.5519C8.0704 16.2983 8.19786 12.7931 10.2427 9.72675C12.2875 6.66042 15.4735 5.1946 17.3638 6.44819Z"
        fill="#08529B"
      />
      <path
        d="M13.1827 17.4879C14.7339 16.2614 14.3732 13.2299 12.3795 10.715C10.3857 8.19997 7.50941 7.15561 5.96182 8.37914C4.41422 9.60266 4.77136 12.6371 6.76568 15.1527C8.75999 17.6683 11.6357 18.7115 13.1827 17.4879Z"
        fill="#1468AE"
      />
    </svg>
  );
}

export default CareIcon;
