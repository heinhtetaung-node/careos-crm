import { useFormikContext } from 'formik';
import _isEmpty from 'lodash/isEmpty';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import TableHeader from './Common/TableHeader';
import CreditCardInstallmentSection from './CreditCardInstallment';
import FullPaymentSection from './FullPayment';
import {
  SelectedPaymentInfo,
  transformPaymentOptionToSelectedData,
} from './helper';
import RabbitInstallmentSection from './RabbitInstallment';

import {
  FullPayment,
  RabbitCareInstallment,
  CreditCardInstallment,
  Option,
} from '../interface';
import DebitCardInstallmentSection from './DebitCardInstallment';

interface PricingProps {
  pricingData: {
    fullPayment?: FullPayment;
    rabbitCareInstallment?: RabbitCareInstallment;
    creditCardInstallment?: CreditCardInstallment;
    directDebitInstallment?: CreditCardInstallment;
  };
}

function Pricing({ pricingData }: PricingProps) {
  const { values, setValues } = useFormikContext<SelectedPaymentInfo>();

  const checkSelected = (option: Option) =>
    option.paymentMethod === values.paymentMethod &&
    option.paymentOption === values.paymentOption &&
    option.installment === values.numberOfInstallment &&
    (_isEmpty(option.issuingBank) ||
      option.issuingBank === values.cardProvider);

  const checkSelectedDirectDebit = (option: Option) =>
    option.paymentMethod === values.paymentMethod &&
    option.paymentOption === 'DIRECT_DEBIT_INSTALLMENT' &&
    option.installment === values.numberOfInstallment &&
    (_isEmpty(option.issuingBank) ||
      option.issuingBank === values.cardProvider);

  const handleSelect = (option: SelectedPaymentInfo) => {
    setValues(transformPaymentOptionToSelectedData(option, values));
  };

  return (
    <div className="p-4 pt-2" data-testid="pricing-section">
      <TableHeader />

      {!!pricingData.fullPayment && (
        <FullPaymentSection
          fullPaymentData={pricingData.fullPayment}
          checkSelected={checkSelected}
          handleSelect={handleSelect}
        />
      )}

      {!!pricingData.rabbitCareInstallment && (
        <RabbitInstallmentSection
          rabbitCareInstallmentData={pricingData.rabbitCareInstallment}
          checkSelected={checkSelected}
          handleSelect={handleSelect}
        />
      )}

      {/* Comment for a whilte */}
      {!!pricingData.directDebitInstallment && (
        <DebitCardInstallmentSection
          creditCardPaymentData={pricingData.directDebitInstallment}
          checkSelected={checkSelectedDirectDebit}
          handleSelect={handleSelect}
          selectedBankCard={values.cardProvider as string}
          resetSelected={() => console.log('reset')}
        />
      )}

      {!!pricingData.creditCardInstallment && (
        <CreditCardInstallmentSection
          creditCardPaymentData={pricingData.creditCardInstallment}
          checkSelected={checkSelected}
          handleSelect={handleSelect}
          resetSelected={() => console.log('reset')}
        />
      )}

      <div className="pb-4">
        {getString('discountPricing.installmentRemark')}
      </div>
    </div>
  );
}

export default Pricing;
