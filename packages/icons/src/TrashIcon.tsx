import React from 'react';
import IconProps from './interface';

function TrashIcon(props: IconProps) {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="primary"
      {...props}
    >
      <path
        d="M8.6,14.8a.8.8,0,0,0,.8-.8V9.2a.8.8,0,0,0-1.6,0V14A.8.8,0,0,0,8.6,14.8Zm8-9.6H13.4V4.4A2.4,2.4,0,0,0,11,2H9.4A2.4,2.4,0,0,0,7,4.4v.8H3.8a.8.8,0,1,0,0,1.6h.8v8.8A2.4,2.4,0,0,0,7,18h6.4a2.4,2.4,0,0,0,2.4-2.4V6.8h.8a.8.8,0,1,0,0-1.6Zm-8-.8a.8.8,0,0,1,.8-.8H11a.8.8,0,0,1,.8.8v.8H8.6Zm5.6,11.2a.8.8,0,0,1-.8.8H7a.8.8,0,0,1-.8-.8V6.8h8Zm-2.4-.8a.8.8,0,0,0,.8-.8V9.2a.8.8,0,1,0-1.6,0V14A.8.8,0,0,0,11.8,14.8Z"
        transform="translate(-3 -2)"
        fill="currentColor"
      ></path>
    </svg>
  );
}

export default TrashIcon;
