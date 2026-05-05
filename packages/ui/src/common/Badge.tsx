import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  badge?: React.ReactElement | string;
  variant?: 'primary' | 'warning';
}

const getVariantClass = (variant: BadgeProps['variant']) => {
  switch (variant) {
    case 'primary':
      return 'bg-primary';
    case 'warning':
      return 'bg-warning';
    default:
      return '';
  }
};

function Badge({
  children,
  badge,
  variant = 'primary',
}: PropsWithChildren<BadgeProps>) {
  return (
    <div className="inline-flex relative items-center p-3 my-2">
      {children}
      {badge && (
        <div
          className={clsx(
            'inline-flex absolute -top-2 -right-2 justify-center items-center py-1 px-2 text-small text-white rounded-full',
            getVariantClass(variant)
          )}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

export default Badge;
