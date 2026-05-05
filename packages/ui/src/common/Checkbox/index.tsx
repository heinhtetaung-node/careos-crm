import clsx from 'clsx';
import React from 'react';

interface CheckboxProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataTestId?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  checkboxSize?: 'normal' | 'large';
  label?: string | JSX.Element;
  smallLabel?: string | JSX.Element;
  description?: string | JSX.Element;
  value?: number | string;
}

function Checkbox({
  dataTestId,
  onChange,
  label,
  smallLabel,
  description,
  value,
  checked = false,
  disabled = false,
  className = '',
  checkboxSize = 'normal',
}: CheckboxProps) {
  return (
    <div className={`flex ${className}`}>
      <input
        type="checkbox"
        data-testid={dataTestId}
        className={clsx('flex pr-3 justify-center items-center p-2 mt-1', {
          'accent-primary': checked,
          'h-6 w-6': checkboxSize === 'large',
          'h-4 w-4': checkboxSize === 'normal',
        })}
        value={value}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      {label && (
        <label htmlFor="input" className="pl-2 max-w-[95%]">
          <div className="flex flex-col">
            <span className="text-base font-bold leading-6">{label}</span>
            {smallLabel && (
              <span className="text-base font-normal mt-1 leading-5">
                {smallLabel}
              </span>
            )}
            {description && (
              <span className="text-xs font-normal mt-1 text-lightgray">
                {description}
              </span>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

export default Checkbox;
