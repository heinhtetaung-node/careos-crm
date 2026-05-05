import React from 'react';

import IconProps from './interface';

function CalendarRounded({ fillColor = '#005098', className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill={fillColor}
      className={className}
    >
      <path
        d="M19.5 4H18.5V3C18.5 2.45 18.05 2 17.5 2C16.95 2 16.5 2.45 16.5 3V4H8.5V3C8.5 2.45 8.05 2 7.5 2C6.95 2 6.5 2.45 6.5 3V4H5.5C4.39 4 3.51 4.9 3.51 6L3.5 20C3.5 21.1 4.39 22 5.5 22H19.5C20.6 22 21.5 21.1 21.5 20V6C21.5 4.9 20.6 4 19.5 4ZM19.5 19C19.5 19.55 19.05 20 18.5 20H6.5C5.95 20 5.5 19.55 5.5 19V9H19.5V19ZM7.5 11H9.5V13H7.5V11ZM11.5 11H13.5V13H11.5V11ZM15.5 11H17.5V13H15.5V11Z"
        fill="white"
      />
    </svg>
  );
}

export default CalendarRounded;
