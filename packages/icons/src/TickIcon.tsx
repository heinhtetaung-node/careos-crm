import React from 'react';
import clsx from 'clsx';
import IconProps from './interface';

function TickIcon({ className, fontSize = 'default' }: IconProps) {
  return (
    <svg
      width={clsx({
        32: fontSize === 'large',
        28: fontSize === 'default' || fontSize === 'medium',
        24: fontSize === 'small',
      })}
      height={clsx({
        20: fontSize === 'large',
        16: fontSize === 'default' || fontSize === 'medium',
        14: fontSize === 'small',
      })}
      viewBox="0 0 15 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.867 0.3C13.467 -0.1 12.867 -0.1 12.467 0.3L4.96699 7.8L1.86699 4.6999C1.46699 4.2999 0.866992 4.2999 0.466992 4.6999C0.0669922 5.0999 0.0669922 5.69993 0.466992 6.09993L4.26699 9.89998C4.66699 10.3 5.26699 10.3 5.66699 9.89998L13.867 1.6999C14.267 1.3999 14.367 0.8 13.867 0.3C13.967 0.3 13.967 0.3 13.867 0.3Z"
        fill="#2FCE82"
      />
    </svg>
  );
}

export default TickIcon;
