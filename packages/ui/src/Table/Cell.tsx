import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface RowProps {
  content: React.ReactNode;
  width?: string | number;
  selectionType?: string;
  isSelected: boolean;
  className?: string;
}

function Cell({
  content,
  width,
  selectionType,
  isSelected,
  className,
}: RowProps) {
  return (
    <div
      className={twMerge(
        clsx('h-4 grow p-3 flex items-center', {
          'bg-gray-100': !isSelected,
          'bg-green-100': isSelected,
        }),
        className
      )}
      // eslint-disable-next-line react/forbid-dom-props
      style={{ width }}
      data-testid="display-table-cell"
    >
      {selectionType !== 'none' && (
        <input
          className="min-w-[20px] min-h-[20px]"
          type={selectionType}
          checked={isSelected}
        />
      )}
      {content}
    </div>
  );
}

export default Cell;
