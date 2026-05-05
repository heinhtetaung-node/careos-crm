import React from 'react';
import { twMerge } from 'tailwind-merge';

interface HeaderProps {
  text: string;
  width?: number | string;
  className?: string;
}
function Header({ text, width, className }: HeaderProps) {
  return (
    <div
      className={twMerge(
        'bg-primary text-white grow p-3 first:rounded-tl-lg last:rounded-tr-lg',
        className
      )}
      // eslint-disable-next-line react/forbid-dom-props
      style={{ width }}
      data-testid="display-table-header"
    >
      {text}
    </div>
  );
}

export default Header;
