/* eslint-disable react/button-has-type */
import clsx from 'clsx';
import React from 'react';

import { LoadingIcon } from '@alphafounders/icons';

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  text: string | React.ReactNode;
  stopPropagating?: boolean;
  icon?: React.ReactElement;
  variant?: 'primary' | 'secondary' | 'custom';
  className?: string;
  disabled?: boolean;
  dataTestId?: string;
  isLoading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  rounded?: boolean;
  id?: string;
  roundedNone?: boolean;
  iconType?: 'svg' | 'img';
}

function Button({
  onClick,
  id,
  text,
  icon,
  stopPropagating = false,
  variant = 'primary',
  className = '',
  disabled = false,
  dataTestId,
  isLoading = false,
  loadingText = '',
  type = 'button',
  rounded = false,
  roundedNone = false,
  iconType = 'svg',
}: Readonly<ButtonProps>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagating) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClick?.(e);
  };

  return (
    <button
      id={id}
      type={type}
      className={clsx(
        'font-bold uppercase flex items-center justify-center border-solid cursor-pointer',
        {
          'bg-primary text-white border-none disabled:bg-disabledColor disabled:cursor-default':
            variant === 'primary',
          'bg-white border-1 text-primary border-primary disabled:text-muted-dark disabled:border-muted-dark disabled:cursor-default':
            variant === 'secondary',
          'font-normal': variant === 'custom',
          'rounded-lg': !rounded && !roundedNone,
          'rounded-full': rounded,
          'rounded-none': roundedNone,
        },
        className
      )}
      onClick={handleClick}
      disabled={isLoading || disabled}
      data-testid={dataTestId}
    >
      {isLoading ? (
        <div
          className="flex justify-center items-center"
          data-testid="loading-btn"
        >
          <LoadingIcon />
          {` ${loadingText}`}
        </div>
      ) : (
        <>
          {iconType === 'svg' ? (
            icon
          ) : (
            <img src={icon?.toString() as string} className="w-7" />
          )}
          {text}
        </>
      )}
    </button>
  );
}

export default Button;
