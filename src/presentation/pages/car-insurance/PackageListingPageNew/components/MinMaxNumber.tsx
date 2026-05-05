import React from 'react';
import { satangToBaht } from 'utils/currency';

export default function MinMaxNumber({
  min,
  max,
  highlighted,
}: Readonly<{
  min: number;
  max: number;
  highlighted?: number;
}>) {
  const formatPrice = (price: number) => price.toLocaleString('en-US');

  return (
    <div className="flex flex-row items-center h-8 w-full justify-evenly">
      {highlighted && (
        <span className="text-primaryColor text-opacity-50 text-[.6rem] self-end">
          {formatPrice(satangToBaht(min))}
        </span>
      )}
      <span className="text-primaryColor text-xs font-medium self-center items-center justify-center">
        {highlighted
          ? formatPrice(satangToBaht(highlighted))
          : `${formatPrice(satangToBaht(min))} - ${formatPrice(
              satangToBaht(max)
            )}`}
      </span>

      {highlighted && (
        <span className="text-primaryColor text-opacity-50 text-[.6rem] self-end">
          {formatPrice(satangToBaht(max))}
        </span>
      )}
    </div>
  );
}
