import _camelCase from 'lodash/camelCase';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import { Option, RabbitCareInstallment } from '../../interface';
import { handleAmount, handlePercent } from '../Common/helper';
import InformationRow from '../Common/InformationRow';
import TableData from '../Common/TableData';

interface RabbitCareInstallmentProps {
  rabbitCareInstallmentData: RabbitCareInstallment;
  checkSelected: (arg: Option) => boolean;
  handleSelect: (arg: {
    paymentOption: string;
    paymentMethod: string;
    numberOfInstallment: number;
    discountType: string;
    discountPercentage?: number;
  }) => void;
}

function RabbitCareInstallmentSection({
  rabbitCareInstallmentData,
  checkSelected,
  handleSelect,
}: RabbitCareInstallmentProps) {
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
      paymentOption={getString(`paymentOptions.RABBIT_CARE_INSTALLMENT`)}
      dataTestId="rabbitInstallment-section"
    >
      <div
        className={`grid grid-rows-${
          Object.keys(rabbitCareInstallmentData.options).length
        } text-center gap-1 w-full`}
      >
        {rabbitCareInstallmentData?.options?.map((RCI) => (
          <div
            className={`grid grid-rows-${RCI.options.length} text-center gap-1 w-full pb-2`}
            key={RCI.name}
          >
            <span className="text-left text-sm font-bold">
              {getString(`discountPricing.${_camelCase(RCI.name)}`)}
            </span>
            {RCI.options.map((RCIOptions) => (
              <InformationRow
                key={`${RCIOptions.paymentOption}-${RCIOptions.installment}`}
                plans={getString('packageListing.xMonth', {
                  x: RCIOptions.installment,
                })}
                initialAmount={handleAmount(RCIOptions.initialAmount)}
                subsequentAmount={handleAmount(RCIOptions.subsequentAmount)}
                feeAmount={handleAmount(RCIOptions.feeAmount)}
                discountAmount={handleAmount(RCIOptions.discountAmount)}
                discountRate={handlePercent(RCIOptions.discountRate)}
                netPremiumAmount={handleAmount(RCIOptions.netPremiumAmount)}
                handleOnClick={() => handleOptionSelect(RCIOptions)}
                isSelected={checkSelected(RCIOptions)}
              />
            ))}
          </div>
        ))}
      </div>
    </TableData>
  );
}

export default RabbitCareInstallmentSection;
