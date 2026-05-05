import clsx from 'clsx';
import React from 'react';

interface InformationRowProps {
  plans: string;
  initialAmount: string;
  subsequentAmount: string;
  feeAmount: string;
  discountAmount: string;
  discountRate: string | number;
  netPremiumAmount: string;
  handleOnClick: () => void;
  isSelected: boolean;
}

function InformationRow({
  plans,
  initialAmount,
  subsequentAmount,
  feeAmount,
  discountAmount,
  discountRate,
  netPremiumAmount,
  handleOnClick,
  isSelected,
}: Readonly<InformationRowProps>) {
  return (
    <div
      className="grid grid-cols-8 text-center gap-1 w-full"
      data-testid="informationRow-container"
      onClickCapture={handleOnClick}
    >
      <span
        className={clsx(
          'col-span-2 h-8 flex items-center px-3 py-1 justify-start border-solid border-0 text-left',
          {
            'bg-green-100 border-success pl-[10px] border-l-[2px]': isSelected,
            'bg-gray-100': !isSelected,
          }
        )}
      >
        <input
          type="radio"
          className="min-w-[20px] min-h-[20px] mt-0 mr-2"
          checked={isSelected}
          data-testid="input-radio"
        />
        {plans}
      </span>
      <span
        className={clsx('h-8 flex items-center px-3 py-1 justify-end', {
          'bg-green-100': isSelected,
          'bg-gray-100': !isSelected,
        })}
      >
        {initialAmount}
      </span>

      <span
        className={clsx('h-8 flex items-center px-3 py-1 justify-end', {
          'bg-green-100': isSelected,
          'bg-gray-100': !isSelected,
        })}
      >
        {subsequentAmount}
      </span>

      <span
        className={clsx('h-8 flex items-center px-3 py-1 justify-end', {
          'bg-green-100': isSelected,
          'bg-gray-100': !isSelected,
        })}
      >
        {feeAmount}
      </span>

      <span
        className={clsx('h-8 flex items-center px-3 py-1 justify-end', {
          'bg-green-100': isSelected,
          'bg-gray-100': !isSelected,
        })}
      >
        {discountAmount}
      </span>

      <span
        className={clsx('h-8 flex items-center px-3 py-1 justify-end', {
          'bg-green-100': isSelected,
          'bg-gray-100': !isSelected,
        })}
      >
        {discountRate}
      </span>
      <span
        className={clsx(
          'h-8 flex items-center px-3 py-1 justify-end font-bold',
          {
            'bg-green-100': isSelected,
            'bg-gray-100': !isSelected,
          }
        )}
      >
        {netPremiumAmount}
      </span>
    </div>
  );
}

export default InformationRow;
