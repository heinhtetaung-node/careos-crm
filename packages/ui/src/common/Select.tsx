import React from 'react';
import clsx from 'clsx';

type Option = {
  id: number | string;
  value: number | string;
  title: string;
};

interface SelectProps {
  options: Option[];
  optionsProps?: {
    className?: string;
  };
  value: number | string;
  onSelect: (
    value: number | string,
    e?: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  className?: string;
  stopPropagating?: boolean;
  variant?: 'secondary' | 'primary';
  title?: string;
  'data-testid'?: string;
}

export const getVariantClassName = (variant: SelectProps['variant']) => {
  switch (variant) {
    case 'primary':
      return {
        select:
          'border text-pacehoder p-3 border-solid border-gray-200 rounded-xl bg-white',
        option: 'bg-white border h-3 w-6',
      };
    case 'secondary':
      return {
        select:
          'text-lg font-semibold m-0 outline-none border-none text-primary bg-white',
        option: '',
      };
    default:
      return { select: '', option: '' };
  }
};

function Select({
  options,
  value,
  onSelect,
  className,
  title,
  stopPropagating = false,
  ...rest
}: Readonly<SelectProps>) {
  const preventPropagation = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (stopPropagating) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <select
      title={`select-${title}`}
      value={value}
      onChange={(e) => onSelect(parseInt(e.target.value, 10), e)}
      className={clsx(
        'text-lg font-semibold m-0 outline-none border-none bg-white text-primary',
        className
      )}
      data-testid={rest['data-testid']}
      onClick={preventPropagation}
    >
      {options.map((option: Option) => (
        <option key={option.id} value={option.value}>
          {option.title}
        </option>
      ))}
    </select>
  );
}

export default Select;
