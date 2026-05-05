import clsx from 'clsx';
import React from 'react';

interface InputProps {
  error?: string | JSX.Element;
  success?: string | JSX.Element;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  adornment?: string | JSX.Element;
  value?: string;
  disabled?: boolean;
  className?: string;
  dataTestId?: string;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FormEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FormEvent<HTMLInputElement>) => void;
  onPaste?: (event: React.FormEvent<HTMLInputElement>) => void;
}

function Input({
  id,
  name,
  error,
  success,
  placeholder,
  label,
  adornment,
  className,
  dataTestId,
  disabled = false,
  value = '',
  onChange,
  onFocus,
  onBlur,
  onPaste,
}: InputProps) {
  return (
    <div className={clsx(className, 'flex justify-end flex-col w-full mx-2')}>
      <label
        htmlFor={id || name}
        className={clsx(
          `text-[10px] text-slate-800 capitalize min-h-[11px] mb-1`,
          error && '!text-red-600',
          success && '!text-green-600'
        )}
      >
        {label}
      </label>
      <div className="flex flex-row justify-start h-[42px]">
        <input
          id={id || name}
          className={clsx(
            `transition border-2 border-solid border-slate-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-0 min-w-[150px] w-full p-0 px-2 h-[42px]`,
            success &&
              '!border-green-600 !focus:border-green-600 !hover:border-green-600 !text-green-600 !placeholder:text-green-600',
            error &&
              '!border-red-600 !focus:border-red-600 !hover:border-red-600 !text-red-600 !placeholder:text-red-600',
            disabled &&
              '!border-stone-300 !focus:border-stone-300 !hover:border-stone-300 !placeholder:text-stone-300 !bg-stone-300',
            adornment && '!rounded-l rounded-none',
            !adornment && 'rounded'
          )}
          data-testid={dataTestId}
          {...{
            value,
            placeholder,
            disabled,
            onChange,
            onBlur,
            onFocus,
            onPaste,
          }}
        />
        {adornment && (
          <span
            data-testid="adornment-element"
            className="flex items-center justify-center p-2 px-3 z-2 pointer-events-none rounded-none !rounded-r bg-gray-200"
          >
            {adornment}
          </span>
        )}
      </div>
      <span
        data-testid="validation-element"
        className={clsx(
          'mt-1 text-[10px] min-h-[12px]',
          error && 'text-red-600',
          success && 'text-green-600'
        )}
      >
        {error || success}
      </span>
    </div>
  );
}

export default Input;
