import clsx from 'clsx';
import React from 'react';

import { getFormattedPrice } from '../utils/price';

interface PriceProps {
  value: number | string;
  variant?: 'normal' | 'oldPrice' | 'newPrice';
  className?: string;
  'data-testid'?: string;
}

const getClassName = (variant: PriceProps['variant']) => {
  switch (variant) {
    case 'normal':
      return 'text-black';
    case 'oldPrice':
      return 'text-black line-through';
    case 'newPrice':
      return 'text-red-500';
    default:
      return '';
  }
};

function Price({
  value,
  variant = 'normal',
  className = '',
  ...rest
}: PriceProps) {
  return (
    <span
      className={clsx(getClassName(variant), className)}
      data-testid={rest['data-testid']}
    >
      {getFormattedPrice(value)}
    </span>
  );
}

export default Price;
