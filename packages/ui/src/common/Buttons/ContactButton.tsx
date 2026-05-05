import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import AnchorButton from './AnchorButton';

interface ContactButtonProps {
  href?: string;
  imagePath: string;
  altText: string;
  className?: string;
  ariaLabel?: string;
  icon?: JSX.Element;
  key?: string;
}

function ContactButton({
  href,
  imagePath,
  altText,
  className,
  ariaLabel,
  icon,
}: Readonly<ContactButtonProps>) {
  return (
    <AnchorButton
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel ?? null}
      className={twMerge(
        clsx(
          'bg-primary border-primary hover:md:bg-primary-dark',
          'w-[26px] h-[26px] sm:h-[1.875rem] sm:w-[1.875rem] lg:h-[2.25rem] lg:w-[2.25rem] p-0'
        ),
        className
      )}
      icon={icon ?? <img src={imagePath} alt={altText} />}
    />
  );
}

export default ContactButton;
