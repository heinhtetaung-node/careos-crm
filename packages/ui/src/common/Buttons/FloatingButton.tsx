import clsx from 'clsx';
import Button from 'common/Button';
import React from 'react';

interface FloatingButtonConfig {
  label?: string;
  icon?: React.ReactElement;
  className?: string;
  position: string;
  helperText?: string;
  onClick: () => void;
}

interface FloatingButtonsProps {
  label?: string;
  icon?: React.ReactElement;
  className?: string;
  floatingButtons?: FloatingButtonConfig[];
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  icon,
  label,
  className,
  floatingButtons = [],
}) => {
  return (
    <div className="relative inline-block group">
      {/* Main Button */}
      <Button
        className={clsx('bg-blue-500 text-white p-4 rounded-full', className)}
        text={label}
        icon={icon}
      />

      {/* Floating Buttons */}
      {floatingButtons.map((button, index) => (
        <Button
          variant="custom"
          key={index}
          rounded
          className={clsx(
            `absolute ${button.position} text-primary !shadow-lg bg-white min-h-6 min-w-6 p-2 opacity-0 group-hover:opacity-100 transform transition-all duration-300 !z-20 ease-in-out -translate-y-3 group-hover:translate-y-0 border border-transparent hover:!translate-y-3 hover:border-primary`,
            button?.className
          )}
          onClick={button.onClick}
          icon={button?.icon}
          text={button?.label}
        />
      ))}
    </div>
  );
};

export default FloatingButtons;
