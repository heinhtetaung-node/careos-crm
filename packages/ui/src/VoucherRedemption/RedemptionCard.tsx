import React from 'react';
import { RedemptionCardProps } from './interfaces';
import Button from 'common/Button';
import clsx from 'clsx';

const RedemptionCard = ({
  partnerName,
  discount,
  code,
  copyButtonText,
  className,
  onCopyCode,
  isCopied,
}: RedemptionCardProps) => {
  return (
    <div
      className={clsx(
        'border border-solid border-[#757575] mx-auto bg-white rounded-lg p-4 max-w-full',
        'flex flex-col justify-center items-center gap-10',
        className
      )}
    >
      <div className="text-center font-normal text-[#1E1E1E]">
        <span>{partnerName}</span>
        <span className="mx-2">-</span>
        <span>{discount}</span>
      </div>
      <div className="text-muted-darker">{code}</div>
      <Button
        text={copyButtonText ?? 'Copy Code'}
        onClick={onCopyCode}
        className="py-[15px] px-[16px] cursor-copy"
        disabled={isCopied}
      />
    </div>
  );
};

export default RedemptionCard;
