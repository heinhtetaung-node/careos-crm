import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

interface ContainerProps {
  className?: string;
}

function Container({
  children,
  className = '',
}: PropsWithChildren<ContainerProps>) {
  return (
    <div className={clsx('w-container mx-auto p-2', className)}>{children}</div>
  );
}

export default Container;
