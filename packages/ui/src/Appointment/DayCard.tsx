import clsx from 'clsx';
import React, { useEffect } from 'react';

import useUIContext from 'Context/useUIContext';
import useScrollTo from 'utils/useScrollTo';

export interface DayCardProps {
  id: string;
  day?: string;
  date?: string;
  free?: number;
  paymentCall?: number;
  appointment?: number;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (id: string, e: React.MouseEvent<HTMLDivElement>) => void;
}

function DayCard({
  id,
  day,
  date,
  free,
  paymentCall,
  appointment,
  loading,
  onClick,
  active = false,
  disabled = false,
}: DayCardProps) {
  const { t } = useUIContext();
  const [cardRef, scroll] = useScrollTo();
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    onClick?.(id, e);
  };

  useEffect(() => {
    scroll(active);
  }, [active, scroll]);

  return (
    <div
      className={clsx(
        'min-w-[10.625rem] h-[8rem] border rounded-xl border-muted-light border-solid px-3 py-5 cursor-pointer',
        {
          'bg-muted-light opacity-50': disabled,
          'bg-primary-light border-2 border-primary': active,
        }
      )}
      data-testid={`daycard-${id}`}
      role="button"
      tabIndex={0}
      onKeyDown={() => null}
      onClick={handleClick}
      ref={cardRef}
    >
      {loading ? (
        <div role="status" className="animate-pulse" data-testid="card-loading">
          <div className="h-8 bg-muted-light rounded my-4" />
          <div className="h-2 bg-muted-light rounded my-2" />
          <div className="h-2 bg-muted-light rounded my-2" />
          <div className="h-2 bg-muted-light rounded my-2" />
        </div>
      ) : (
        <>
          <div className="font-bold text-lg mt-1">{day}</div>
          <div className="text-medium">{`(${date})`}</div>
          <div className="flex justify-between my-2 font-normal text-base">
            <div>{t('numberOfFreeSlot')}</div>
            <div>{free}</div>
          </div>
          <div className="flex justify-between my-2 font-normal text-base">
            <div>{t('numberOfPaymentCall')}</div>
            <div className="text-red-600">{paymentCall}</div>
          </div>
          <div className="flex justify-between my-2 font-normal text-base">
            <div>{t('numberOfAppointment')}</div>
            <div className="text-success">{appointment}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default DayCard;
