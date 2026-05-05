import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  id?: string;
  dataTestId?: string;
  href?: string;
  className?: string;
  rel?: string;
  target?: string;
  onClick?: () => void;
  icon?: JSX.Element;
}

function AnchorButton({
  icon,
  dataTestId,
  className,
  children,
  ...rest
}: PropsWithChildren<Props>) {
  return (
    <a
      data-testid={dataTestId}
      className={twMerge(
        clsx(
          'flex max-h-[2.625rem] justify-center items-center no-underline rounded-full',
          'p-2 border border-solid space-x-2'
        ),
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </a>
  );
}

export default AnchorButton;
