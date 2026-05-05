import { useFormikContext } from 'formik';
import React from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Select from 'presentation/components/common/Select';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

import { PaymentSelectionProps } from './types';

import DetailViewDatepicker from '../FormikFields/DetailViewDatepicker';

function PaymentSelection({
  isLoading,
  paymentOptions,
  paymentMethods,
  installmentPlans,
  issuingBanks,
  isFullPayment,
  isCustomPackage,
  isReadOnly,
}: PaymentSelectionProps) {
  const { values, setFieldValue } = useFormikContext<{
    paymentOption: number;
    paymentMethod?: number;
    issuingBank?: number;
    installmentPlan?: number;
    installmentDate?: string;
  }>();

  const setIssuingBank = (index: number) => {
    setFieldValue('issuingBank', index);
    if (!isReadOnly) setFieldValue('installmentPlan', 0);
  };
  const setPaymentMethod = (index: number) => {
    setFieldValue('paymentMethod', index);
    setFieldValue('installmentPlan', 0);
  };

  const setPaymentOption = (index: number) => {
    setFieldValue('paymentOption', index);
    setPaymentMethod(0);
  };

  const renderPaymentSelection = () => {
    if (isLoading)
      return (
        <div className="h-36">
          <Spinner />
        </div>
      );

    return (
      <div className="w-full flex flex-wrap">
        <InputContainer
          title={getString('paymentDetails.paymentOption')}
          showAsterisk={!isReadOnly}
          isReadOnly={isReadOnly}
        >
          <div className="p-1.5 w-48 overflow-hidden">
            {isReadOnly ? (
              <span data-testid="payment-option">
                {paymentOptions[values.paymentOption].text}
              </span>
            ) : (
              <Select
                dataTestId="payment-option"
                type="default"
                currentIndex={values.paymentOption}
                options={paymentOptions}
                handleDataSelect={setPaymentOption}
              />
            )}
          </div>
        </InputContainer>
        {/* Should only show this if there are payment methods */}
        {paymentMethods && paymentMethods.length > 0 && (
          <InputContainer
            title={getString('paymentDetails.paymentMethod')}
            showAsterisk={!isReadOnly}
            isReadOnly={isReadOnly}
          >
            <div className="p-1.5 w-48 overflow-hidden">
              {isReadOnly ? (
                <span data-testid="payment-method">
                  {paymentMethods[values.paymentMethod ?? 0].text}
                </span>
              ) : (
                <Select
                  dataTestId="payment-method"
                  type="default"
                  options={paymentMethods}
                  currentIndex={values.paymentMethod}
                  handleDataSelect={setPaymentMethod}
                />
              )}
            </div>
          </InputContainer>
        )}
        {/* Should only show this if there are issuing banks */}
        {issuingBanks && issuingBanks.length > 0 && (
          <InputContainer
            title={getString('paymentDetails.issuingBank')}
            showAsterisk={!isReadOnly}
            isReadOnly={isReadOnly}
          >
            <div className="p-1.5 w-48 overflow-hidden">
              {isReadOnly ? (
                <span data-testid="issuing-bank">
                  {issuingBanks[values.issuingBank ?? 0].text}
                </span>
              ) : (
                <Select
                  dataTestId="issuing-bank"
                  type="default"
                  options={issuingBanks}
                  currentIndex={values.issuingBank}
                  handleDataSelect={setIssuingBank}
                />
              )}
            </div>
          </InputContainer>
        )}
        {/* Should hide this if installment plans are passed */}
        {installmentPlans && installmentPlans.length > 0 && (
          <InputContainer
            title={getString('paymentDetails.installmentPlan')}
            showAsterisk={!isReadOnly}
            isReadOnly={isReadOnly}
          >
            <div className="p-1.5 w-48 overflow-hidden">
              {isReadOnly ? (
                <span data-testid="installment-plan">
                  {installmentPlans[values.installmentPlan ?? 0].text}
                </span>
              ) : (
                <Select
                  dataTestId="installment-plan"
                  type="default"
                  options={installmentPlans}
                  currentIndex={values.installmentPlan}
                  handleDataSelect={(payload) =>
                    setFieldValue('installmentPlan', payload)
                  }
                />
              )}
            </div>
          </InputContainer>
        )}
        <DetailViewDatepicker
          dataTestId="payment-date"
          name="installmentDate"
          handleUpdate={(val) =>
            setFieldValue(
              'installmentDate',
              format(new Date(val.installmentDate), 'dd/MM/yyyy')
            )
          }
          value={values.installmentDate}
          title={
            isFullPayment
              ? getString('paymentDetails.installmentDetails.paymentDate')
              : getString(
                  'paymentDetails.installmentDetails.firstInstallmentDate'
                )
          }
          showAsterisk
          placeholder="DD/MM/YYYY"
        />
      </div>
    );
  };

  return (
    <SectionWrapper
      summary={getString('paymentDetails.paymentSelection')}
      details={renderPaymentSelection()}
      hideBadge
      testId="payment-selection-container"
      headerTestId="payment-selection-section"
    />
  );
}

export default PaymentSelection;
