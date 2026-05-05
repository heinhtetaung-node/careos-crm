import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

interface CardProps {
  title?: string;
  headerProps?: {
    className: string;
  };
  action?: React.ReactNode;
  variant?: 'info' | 'secondary' | 'primary' | 'muted';
  'data-testid'?: string;
}

const getVariantClass = (variant: CardProps['variant']) => {
  switch (variant) {
    case 'info':
      return 'bg-success text-white';
    case 'secondary':
      return 'bg-secondary text-white';
    case 'primary':
      return 'bg-primary text-white';
    case 'muted':
      return 'bg-muted text-white';
    default:
      return '';
  }
};

function Card({
  title,
  headerProps,
  children,
  action,
  variant = 'info',
  ...props
}: PropsWithChildren<CardProps>) {
  return (
    <section
      className="bg-white my-4 rounded-lg hover:shadow-header hover:cursor-pointer"
      data-testid={props['data-testid']}
    >
      {title && (
        <div
          className={clsx(
            'rounded-t-lg p-3 text-white text-base font-bold flex justify-between',
            getVariantClass(variant),
            headerProps?.className
          )}
          data-testid="card-title-header"
        >
          <span>{title}</span>
          <span>{action}</span>
        </div>
      )}
      {children}
    </section>
  );
}

export default Card;
