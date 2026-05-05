import clsx from 'clsx';
import React from 'react';

export default function ProgressBar({
  shouldAnimate = false,
  bgColor = 'bg-gray-200',
  color = 'bg-orange-400',
}) {
  return (
    <div
      className={clsx(
        'w-full bg-muted-dark bg-opacity-25 h-1 relative overflow-hidden',
        bgColor
      )}
    >
      <div
        className={clsx(
          `h-[0.2rem] w-0 absolute left-0`,
          color,
          shouldAnimate && 'animate-progress-bar'
        )}
      />
    </div>
  );
}
