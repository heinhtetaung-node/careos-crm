import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { PhoneIcon } from '@alphafounders/icons';

import AnchorButton from './AnchorButton';

interface PhoneProps {
  number: string;
  subText?: string;
  className?: string;
}

function PhoneButton({ number, subText, className }: PhoneProps) {
  return (
    <AnchorButton
      href={`tel:${number}`}
      aria-label="Call Us"
      className={twMerge(
        clsx(
          `bg-primary border-primary fill-white md:fill-primary`,
          'md:bg-white md:border-muted-light md:text-primary',
          'md:hover:border-primary-dark md:hover:bg-primary-light',
          'w-[26px] h-[26px] sm:h-[30px] sm:w-[30px]',
          'md:h-[1.875rem] md:w-auto lg:h-[42px] lg:w-auto',
          'p-0 sm:px-[0.4375rem] lg:px-[1.25rem] lg:py-0'
        ),
        className
      )}
      icon={<PhoneIcon />}
    >
      <div className="hidden md:flex flex-col ml-2">
        <span className="font-bold text-xs lg:text-lg leading-0">{number}</span>
        {subText && (
          <div className="-mt-[0.625rem] sm:hidden lg:block">
            <span className="leading-[0.875rem] text-small">{subText}</span>
          </div>
        )}
      </div>
    </AnchorButton>
  );
}

export default PhoneButton;
