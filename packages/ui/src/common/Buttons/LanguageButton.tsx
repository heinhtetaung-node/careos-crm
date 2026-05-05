import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LanguageButtonProps {
  text: string;
  code: string;
  dataTestId?: string;
  selected?: boolean;
  onClick?: (language: string) => void;
  className?: string;
}

function LanguageButton({
  text,
  code,
  dataTestId,
  selected,
  onClick,
  className,
}: Readonly<LanguageButtonProps>) {
  const handleClick = () => {
    if (!onClick) return;
    onClick(code);
  };

  return (
    <div
      role="button"
      data-testid={dataTestId}
      className={twMerge(
        clsx(
          'w-[26px] h-[26px] sm:h-[1.875rem] sm:w-[1.875rem] md:h-[2.25rem] md:w-[2.25rem] cursor-pointer',
          'flex max-h-[2.625rem] justify-center items-center no-underline rounded-full',
          'p-2 border border-solid space-x-2',
          [
            selected
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-primary border-muted-light hover:border-primary hover:bg-primary-light',
          ]
        ),
        className
      )}
      onClick={() => handleClick()}
    >
      <span className="text-xs sm:text-sm font-medium">{text}</span>
    </div>
  );
}

export default LanguageButton;
