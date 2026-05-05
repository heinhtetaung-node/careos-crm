import clsx from 'clsx';
import IconProps from './interface';
import React from 'react';

export default function CrossIcon({
  className,
  fillColor = 'none',
  fontSize,
  width = '13',
  height = '13',
  viewBox = '0 0 13 13',
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      className={clsx([className, fontSize === 'small' && 'text-sm'])}
    >
      <path
        d="M7.56697 6.20015L11.8669 1.9001C12.2669 1.5001 12.2669 0.900195 11.8669 0.500195C11.4669 0.100195 10.867 0.100195 10.467 0.500195L6.16694 4.80024L1.86689 0.500195C1.46689 0.100195 0.866992 0.100195 0.466992 0.500195C0.0669922 0.900195 0.0669922 1.5001 0.466992 1.9001L4.76692 6.20015L0.466992 10.5002C0.0669922 10.9002 0.0669922 11.5001 0.466992 11.9001C0.866992 12.3001 1.46689 12.3001 1.86689 11.9001L6.16694 7.60005L10.467 11.9001C10.867 12.3001 11.4669 12.3001 11.8669 11.9001C12.2669 11.5001 12.2669 10.9002 11.8669 10.5002L7.56697 6.20015Z"
        fill="#EA4548"
      />
    </svg>
  );
}
