import { Select, MenuItem } from '@material-ui/core';
import _camelCase from 'lodash/camelCase';
import React, { useCallback, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import { CreditCardInstallment, Option } from '../../interface';
import { handleAmount, handlePercent } from '../Common/helper';
import InformationRow from '../Common/InformationRow';
import TableData from '../Common/TableData';

interface CreditCardInstallmentProps {
  creditCardPaymentData: CreditCardInstallment;
  checkSelected: (arg: Option) => boolean;
  handleSelect: (arg: {
    paymentOption: string;
    paymentMethod: string;
    numberOfInstallment: number;
    discountType: string;
    discountPercentage?: number;
    cardProvider?: string;
  }) => void;
  resetSelected: () => void;
  selectedBankCard: string;
}

function DebitCardInstallmentSection({
  creditCardPaymentData,
  handleSelect,
  checkSelected,
  resetSelected,
  selectedBankCard,
}: CreditCardInstallmentProps) {
  const [selectedBank, setSelectedBank] = useState(
    creditCardPaymentData.cardProviders?.find(
      (card) => card.name === selectedBankCard
    )?.name ?? creditCardPaymentData.cardProviders[0].name
  );

  const ActionSection = useCallback(() => {
    const handleBankChange = (e: React.ChangeEvent<any>) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedBank(e.target.value);
      resetSelected();
    };
    return (
      <Select
        name="issuingBank"
        onChange={handleBankChange}
        className="min-w-[200px]"
        value={selectedBank}
      >
        {creditCardPaymentData.cardProviders.map((bank) => (
          <MenuItem value={bank.name} key={bank.name}>
            {bank.displayName}
          </MenuItem>
        ))}
      </Select>
    );
  }, [creditCardPaymentData.cardProviders, resetSelected, selectedBank]);

  const handleOptionSelect = (option: Option) => {
    handleSelect({
      paymentOption: option.paymentOption,
      paymentMethod: option.paymentMethod,
      numberOfInstallment: option.installment,
      discountType: option.discountType,
      discountPercentage: option.discount?.percentage ?? 0,
      cardProvider: selectedBank,
    });
  };

  return (
    <TableData
      paymentOption={getString(
        `paymentDetails.paymentOptions.directDebitInstallment`
      )}
      action={<ActionSection />}
      dataTestId="creditCardInstallment-section"
    >
      <div
        className={`grid grid-rows-${
          Object.keys(creditCardPaymentData.cards).length
        } text-center gap-1 w-full`}
      >
        {creditCardPaymentData?.cards?.[selectedBank]?.map((CCI) => (
          <div
            className={`grid grid-rows-${CCI.options.length} text-center gap-1 w-full pb-2`}
            key={CCI.name}
          >
            <span className="text-left text-sm font-bold">
              {getString(`discountPricing.${_camelCase(CCI.name)}`)}
            </span>
            {CCI.options.map((RCIOptions) => (
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

export default DebitCardInstallmentSection;
