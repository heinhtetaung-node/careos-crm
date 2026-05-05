import React from 'react';
import { VoucherSummaryProps } from './interfaces';
import clsx from 'clsx';

const VoucherSummary = ({
  image,
  title,
  subtitle,
  description,
  className,
}: VoucherSummaryProps) => {
  return (
    <div
      className={clsx(
        'mx-auto flex flex-col justify-center items-center',
        className
      )}
    >
      <div>{image}</div>
      <div className="text-center">
        <div
          className="my-[18px] font-normal text-[24px]"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
        <p>{subtitle}</p>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default VoucherSummary;
