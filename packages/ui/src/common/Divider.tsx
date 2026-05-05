import clsx from 'clsx';
import React from 'react';

interface DividerProps {
  text?: string;
  pattern?: 'dash' | 'solid';
  orientation?: 'vertical' | 'horizontal';
  variant?: 'primary' | 'secondary';
  className?: string;
}

const getPatternClass = (pattern: DividerProps['pattern']) => {
  switch (pattern) {
    case 'dash':
      return 'border-dashed';
    case 'solid':
      return 'border-solid';
    default:
      return '';
  }
};

const getVariantClass = (variant: DividerProps['variant']) => {
  switch (variant) {
    case 'primary':
      return 'border-gray-400';
    case 'secondary':
      return 'border-muted-light';
    default:
      return '';
  }
};

function Divider({
  text,
  orientation = 'horizontal',
  pattern = 'solid',
  variant = 'primary',
  className = '',
}: DividerProps) {
  const patternClass = getPatternClass(pattern);
  const variantClass = getVariantClass(variant);

  const dividerClassNames = `flex-grow border-b-0 border-t-[1px] ${patternClass} ${variantClass}`;
  return (
    <div
      className={clsx('relative flex py-3 items-center', className, {
        [`border-0 border-l-[1px] ${variantClass} ${patternClass}`]:
          orientation === 'vertical',
      })}
      data-testid="careos-divider"
    >
      <div className={dividerClassNames} />
      {text && <span className="flex-shrink mx-4 text-gray-400">{text}</span>}
      <div className={dividerClassNames} />
    </div>
  );
}

export default Divider;
