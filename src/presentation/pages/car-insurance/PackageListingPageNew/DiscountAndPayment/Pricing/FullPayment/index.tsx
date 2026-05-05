import _camelCase from 'lodash/camelCase';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import { Option, FullPayment } from '../../interface';
import { handleAmount, handlePercent } from '../Common/helper';
import InformationRow from '../Common/InformationRow';
import TableData from '../Common/TableData';
import { numberToMoney, satangToBaht } from 'utils/currency';

interface FullPaymentSectionProps {
  fullPaymentData: FullPayment;
  handleSelect: (arg: {
    paymentOption: string;
    paymentMethod: string;
    numberOfInstallment: number;
    discountType: string;
    discountPercentage?: number;
  }) => void;
  checkSelected: (option: Option) => boolean;
}

function FullPaymentSection({
  fullPaymentData,
  handleSelect,
  checkSelected,
}: FullPaymentSectionProps) {
  const handleOptionSelect = (option: Option) => {
    handleSelect({
      paymentOption: option.paymentOption,
      paymentMethod: option.paymentMethod,
      numberOfInstallment: option.installment,
      discountType: option.discountType,
      discountPercentage: option.discount?.percentage ?? 0,
    });
  };

  return (
    <TableData
      paymentOption={getString(`paymentOptions.FULL_PAYMENT`)}
      dataTestId="fullPayment-section"
    >
      <div
        className={`grid grid-rows-${
          Object.keys(fullPaymentData.options).length
        } text-center gap-1 w-full`}
      >
        {fullPaymentData?.options.map((FP) => (
          <InformationRow
            key={FP.paymentOption}
            plans={getString(`discountPricing.${_camelCase(FP.paymentMethod)}`)}
            initialAmount={handleAmount(FP.initialAmount)}
            subsequentAmount={handleAmount(FP.subsequentAmount)}
            feeAmount={handleAmount(FP.feeAmount)}
            discountAmount={numberToMoney(
              satangToBaht(FP.discountAmount)
            ).toString()}
            discountRate={handlePercent(FP.discountRate)}
            netPremiumAmount={handleAmount(FP.netPremiumAmount)}
            handleOnClick={() => handleOptionSelect(FP)}
            isSelected={checkSelected(FP)}
          />
        ))}
      </div>
    </TableData>
  );
}

export default FullPaymentSection;
