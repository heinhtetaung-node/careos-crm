import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { CustomerIcon, CustomerIconWhite } from '@alphafounders/icons';

import AnchorButton from './AnchorButton';

interface CustomerPortalProps {
  text: string;
  href?: string;
  className?: string;
  icon?: React.ReactElement;
  target?: string;
}

function CustomerPortalButton({
  href,
  text,
  className,
  icon,
  target,
}: CustomerPortalProps) {
  return (
    <AnchorButton
      href={href}
      aria-label="Login to my account"
      target={target}
      className={twMerge(
        clsx(
          'p-0 md:w-auto md:px-2 space-x-0 md:space-x-2 hover:cursor-pointer',
          'w-[26px] h-[26px] sm:h-[1.875rem] sm:w-[1.875rem] lg:h-[2.25rem]',
          'bg-primary text-white fill-primary md:fill-white',
          'border-primary hover:border-primary-dark hover:bg-primary-dark',
          icon && 'md:border-primary md:bg-primary border-none bg-transparent'
        ),
        className
      )}
    >
      {icon ?? (
        <>
          <CustomerIcon className="hidden md:block" />
          <CustomerIconWhite className="md:hidden" />
        </>
      )}

      <div className="hidden md:flex flex-col pr-0.5">
        <span className="font-bold text-sm">{text}</span>
      </div>
    </AnchorButton>
  );
}

export default CustomerPortalButton;
