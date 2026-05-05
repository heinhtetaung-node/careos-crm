import React from 'react';

import useUIContext from 'Context/useUIContext';

interface InstallmentProps {
  firstMonthPayment?: number | string;
  nextMonthPayment?: number | string;
  installmentMonth?: number;
  totalFee?: number | string;
}

function Installment({
  firstMonthPayment,
  nextMonthPayment,
  installmentMonth,
  totalFee,
}: InstallmentProps) {
  const { t } = useUIContext();
  const initialPayment = `${firstMonthPayment} ${t('THB')}`;
  const installment = `${installmentMonth} x ${nextMonthPayment} ${t('THB')}`;
  return (
    <ul className="p-0 my-1 pl-4">
      {firstMonthPayment && (
        <li className="text-base font-normal">{initialPayment}</li>
      )}
      {nextMonthPayment && (
        <li className="text-base font-normal">{installment}</li>
      )}
      {totalFee && (
        <li className="text-base font-normal">
          {`${totalFee} ${t('THB')} `}
          <span>(Fee)</span>
        </li>
      )}
    </ul>
  );
}

export default Installment;
