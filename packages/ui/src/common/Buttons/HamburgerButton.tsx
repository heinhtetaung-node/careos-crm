import React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  isOpen?: boolean;
  onClick?: () => void;
  className?: string;
}

function HamburgerButton({ isOpen = false, onClick, className }: Props) {
  /**
   * Implementing styles inline like this generally isn't preferred but since the project doesn't
   * actually use any css modules and tailwind doesn't support stroke-dash-array and stroke-dash-offset,
   * this is an acceptable compromise for now.
   */
  const pathStyle = {
    transition:
      'stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
    strokeDasharray: isOpen ? '90 207' : '60 207',
    strokeDashoffset: isOpen ? '-134' : '0',
  } as React.CSSProperties;

  return (
    <svg
      className={twMerge(
        'stroke-primary cursor-pointer w-[1.5rem] h-[1.5rem] sm:w-[2.5rem] sm:h-[2.5rem]',
        className
      )}
      viewBox="0 0 100 100"
      onClick={onClick}
      aria-label="Hamburger Menu"
      role="img"
    >
      <path
        className="fill-transparent stroke-[6px]"
        style={pathStyle}
        d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
      />
      <path
        className="stroke-[6px]"
        style={{
          transition:
            'stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          strokeDasharray: isOpen ? '1 60' : '60 60',
          strokeDashoffset: isOpen ? '-30' : '0',
        }}
        d="M 20,50 H 80"
      />
      <path
        className="fill-transparent stroke-[6px]"
        style={pathStyle}
        d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
      />
    </svg>
  );
}

export default HamburgerButton;
