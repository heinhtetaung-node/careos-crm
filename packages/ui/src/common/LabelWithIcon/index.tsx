import clsx from 'clsx';
import React from 'react';

interface LabelWithIconProps {
  readonly name: string;
  readonly value?: string;
  readonly placeholder?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  readonly className?: string;
}

function LabelWithIcon({
  name,
  value,
  placeholder,
  icon,
  onClick,
  className,
}: LabelWithIconProps) {
  return (
    <div
      data-testid={`${name}-labelWithIcon`}
      onClick={onClick}
      role="button"
      onKeyDown={onClick}
      tabIndex={0}
      className={clsx('flex justify-between items-center p-[10px]', className)}
    >
      {value}
      {placeholder && !value && (
        <span className="text-gray-400 cursor-pointer">{placeholder}</span>
      )}
      {icon && <span className="flex items-center cursor-pointer">{icon}</span>}
    </div>
  );
}

export default LabelWithIcon;
