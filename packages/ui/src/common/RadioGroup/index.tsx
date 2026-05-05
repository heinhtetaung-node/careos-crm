import clsx from 'clsx';
import React from 'react';
import Radio from './Radio';

interface OptionProps {
  label: string;
  name: string;
  value: number | string;
}

interface RadioGroupProps {
  dataTestId?: string;
  value: number | string;
  orientation?: 'horizontal' | 'vertical';
  radioType?: 'circle' | 'tick';
  options: OptionProps[];
  field: string;
  isDisabled?: boolean;
  className?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: number | string
  ) => void;
}

function RadioGroup({
  dataTestId,
  className,
  value,
  field,
  options,
  isDisabled = false,
  orientation = 'horizontal',
  radioType = 'circle',
  onChange,
}: RadioGroupProps) {
  return (
    <div
      className={clsx(
        'flex flex-wrap',
        {
          'items-center': orientation === 'horizontal',
          'flex-col items-start': orientation === 'vertical',
        },
        className
      )}
      data-testid={dataTestId}
    >
      {options.map((option) => (
        <Radio
          key={option.name}
          label={option.label}
          id={option.name}
          name={field}
          onChange={onChange}
          value={option.value}
          selected={value === option.value}
          disabled={isDisabled}
          radioType={radioType}
        />
      ))}
    </div>
  );
}

export default RadioGroup;
