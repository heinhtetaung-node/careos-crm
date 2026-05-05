import { useField } from 'formik';
import React from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Controls from 'presentation/components/controls/Control';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { numberToMoney } from 'utils/currency';

interface Props {
  isLoading?: boolean;
  isReadOnly?: boolean;
  mandatoryNotIncluded?: boolean;
  hasFollowingMonthInstallment?: boolean;
  paymentAmountLabel?: string;
}

function PaymentDetailsSection({
  isLoading,
  isReadOnly,
  mandatoryNotIncluded,
  hasFollowingMonthInstallment,
  paymentAmountLabel = 'firstMonth',
}: Props) {
  const [field, , helpers] = useField('firstMonth');
  const [followingMonth, , followingHelpers] = useField('followingMonth');

  const renderPaymentDetails = () => {
    if (isLoading)
      return (
        <div className="h-24">
          <Spinner />
        </div>
      );
    return (
      <div className="w-full flex flex-wrap">
        <InputContainer
          title={
            isReadOnly && !hasFollowingMonthInstallment
              ? getString(
                  `paymentDetails.installmentDetails.${paymentAmountLabel}`
                )
              : getString(
                  'paymentDetails.installmentDetails.firstMonthInstallment'
                )
          }
          isReadOnly={isReadOnly}
          subText={
            mandatoryNotIncluded
              ? getString(
                  'paymentDetails.installmentDetails.mandatoryNotIncluded'
                )
              : ''
          }
          showAsterisk={!isReadOnly && !hasFollowingMonthInstallment}
        >
          <span className="p-2.5">
            {isReadOnly ? (
              <div data-testid="firstMonthInstallment">
                {numberToMoney(field.value)}
              </div>
            ) : (
              <Controls.NumberInput
                dataTestId="firstMonthInstallment"
                value={field.value}
                name="firstMonthInstallment"
                onValueChange={(values) => {
                  helpers.setValue(values.floatValue);
                }}
              />
            )}
          </span>
        </InputContainer>

        {hasFollowingMonthInstallment && (
          <InputContainer
            title={getString(
              'paymentDetails.installmentDetails.followingMonth'
            )}
            isReadOnly
          >
            <span className="p-2.5">
              {isReadOnly ? (
                <div data-testid="followingMonthsInstallment">
                  {numberToMoney(followingMonth.value)}
                </div>
              ) : (
                <Controls.NumberInput
                  dataTestId="followingMonthsInstallment"
                  value={followingMonth.value}
                  name="followingMonthsInstallment"
                  onValueChange={(values) => {
                    followingHelpers.setValue(values.floatValue);
                  }}
                />
              )}
            </span>
          </InputContainer>
        )}
      </div>
    );
  };

  return (
    <SectionWrapper
      summary={getString('paymentDetails.paymentDetails')}
      details={renderPaymentDetails()}
      hideBadge
      testId="payment-details-container"
      headerTestId="payment-details-section"
    />
  );
}

export default PaymentDetailsSection;
