import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  small?: boolean;
  dataTestId?: string;
  loadingText?: string;
  classes?: string;
}

export default function LoadingSpinner({
  small = false,
  dataTestId = 'loading-spinner',
  loadingText = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      data-testid={dataTestId}
      className={clsx('flex justify-center items-center', !small && 'mt-6')}
      role="status"
    >
      <div className="relative -ml-1 mr-3 h-9 w-9 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          {loadingText}
        </span>
      </div>
    </div>
  );
}
