import React from 'react';
import IconProps from './interface';

function AddCircleIcon({ className, fillColor = 'currentcolor' }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.81 10.8101L14.7141 10.81C15.1741 10.81 15.524 10.4601 15.524 10.0001C15.524 9.54015 15.1741 9.19019 14.7141 9.19019L10.8099 9.19019V5.28603C10.8099 4.82606 10.46 4.47611 10 4.47611C9.54003 4.47611 9.19008 4.82606 9.19007 5.28603C9.19007 5.28603 9.19007 5.28603 9.19007 5.28603L9.19002 9.19013L5.28591 9.19019C4.82595 9.19019 4.47599 9.54015 4.47599 10.0001C4.47599 10.4601 4.82595 10.81 5.28592 10.81L9.19007 10.81L9.19007 14.7142C9.19007 15.1742 9.54003 15.5241 10 15.5241C10.46 15.5241 10.8099 15.1742 10.8099 14.7142L10.81 10.8101Z"
        fill={fillColor}
        stroke={fillColor}
        strokeWidth="0.3"
      />
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="9"
        stroke={fillColor}
        strokeWidth="2"
      />
    </svg>
  );
}

export default AddCircleIcon;
