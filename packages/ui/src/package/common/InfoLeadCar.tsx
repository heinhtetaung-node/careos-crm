import React, { useEffect, useState } from 'react';

import { getCarName } from 'utils/window';

import { CarDetails } from '../interfaces';

interface TitleProps {
  title: string;
  orderId: string;
  carDetails?: CarDetails | null;
}

interface carInfo {
  carDetail: {
    top: string;
    bottom: string;
  };
}

function InfoLeadCar({ title, orderId, carDetails }: TitleProps) {
  const [leadCarInfo, setLeadCarInfo] = useState<carInfo | null>(null);
  useEffect(() => {
    if (carDetails) {
      const carDetail = getCarName(carDetails);
      if (carDetail) {
        setLeadCarInfo({
          carDetail: {
            top: carDetail?.top ?? null,
            bottom: carDetail?.bottom ?? null,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carDetails]);

  return (
    <div className="flex flex-col items-center justify-center px-[10px] max-w-[415px] m-auto">
      <span className="text-black text-lg">{title}</span>
      <span className="text-black font-bold text-lg text-center">
        {orderId}
      </span>

      {leadCarInfo?.carDetail?.top && (
        <span
          className="text-black font-bold text-lg text-center"
          data-testid="info-car"
        >
          {leadCarInfo?.carDetail?.top}
        </span>
      )}
      {leadCarInfo?.carDetail?.bottom && (
        <span className="text-black font-bold text-lg text-center">
          {leadCarInfo?.carDetail?.bottom}
        </span>
      )}
    </div>
  );
}

export default InfoLeadCar;
