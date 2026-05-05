import clsx from 'clsx';
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  checked?: boolean;
}

export default function ToggleSwitch({
  label,
  onClick,
  disabled = false,
  checked = false,
}: ToggleSwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <div
      className="flex flex-row justify-center items-center "
      data-testid="toggle-switch-btn"
    >
      {label && (
        <span
          data-testid="toggle-btn-label"
          className="form-check-label leading-tight inline-block text-primary mr-1"
        >
          {label}
        </span>
      )}
      <div
        className={clsx(
          'w-10 h-5 flex items-center rounded-full p-1 cursor-pointer',
          checked ? 'bg-primary' : 'bg-muted-dark'
        )}
        onClick={handleClick}
        onKeyDown={handleClick}
        role="button"
        tabIndex={0}
      >
        <div
          className={clsx(
            'bg-white h-4 w-4 rounded-full shadow-md transform duration-300 ease-in-out',
            checked && 'transform translate-x-4'
          )}
        />
      </div>
    </div>
  );
}
