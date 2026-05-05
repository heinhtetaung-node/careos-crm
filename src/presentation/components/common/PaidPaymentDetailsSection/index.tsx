import React, { useMemo } from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { formatSatangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';

interface Props {
  isLoading?: boolean;
  isReadOnly?: boolean;
  referenceLeadId?: string;
  paidChargesAmount: number | string;
  firstMonthRemainingAmount: number | string;
  firstMonthSurplusAmount: number | string;
  paymentMethod?: string;
  paidPaymentDate?: string;
  availableCreditShell?: number;
  totalCreditUsed?: number;
}

function PaidPaymentDetailsSection({
  isLoading,
  isReadOnly,
  referenceLeadId,
  paidChargesAmount,
  firstMonthRemainingAmount,
  firstMonthSurplusAmount,
  paymentMethod,
  paidPaymentDate,
  availableCreditShell,
  totalCreditUsed,
}: Readonly<Props>) {
  const paidDetails = useMemo(() => {
    const defaultVals = [
      {
        label: 'carepay.changeOrder.referenceLeadId',
        value: referenceLeadId || '-',
      },
      {
        label: 'carepay.changeOrder.paymentMethod',
        value: getString(`paymentMethods.${paymentMethod}`),
      },
      {
        label: 'carepay.changeOrder.paidAmount',
        value: paidChargesAmount ? formatSatangToBaht(paidChargesAmount) : '-',
      },
      {
        label: 'carepay.changeOrder.paymentDate',
        value: paidPaymentDate
          ? format(new Date(paidPaymentDate), 'dd/MM/yyyy')
          : '',
      },
      {
        label: 'carepay.changeOrder.creditShellAvailable',
        value: availableCreditShell
          ? formatSatangToBaht(availableCreditShell)
          : '-',
      },
      {
        label: 'carepay.changeOrder.usedCreditShell',
        value: totalCreditUsed ? formatSatangToBaht(totalCreditUsed) : '-',
      },
      {
        label: 'carepay.changeOrder.additionalPaymentAmount',
        value: firstMonthRemainingAmount
          ? formatSatangToBaht(firstMonthRemainingAmount)
          : '-',
      },
      {
        label: 'carepay.changeOrder.overpaidAmount',
        value: firstMonthSurplusAmount
          ? formatSatangToBaht(firstMonthSurplusAmount)
          : '-',
      },
    ];

    return defaultVals;
  }, [
    referenceLeadId,
    paymentMethod,
    paidChargesAmount,
    paidPaymentDate,
    firstMonthRemainingAmount,
    firstMonthSurplusAmount,
  ]);

  const renderPaymentDetails = () =>
    isLoading ? (
      <div className="h-24">
        <Spinner />
      </div>
    ) : (
      <div className="w-full flex flex-wrap">
        {paidDetails.map(({ label, value }) => (
          <InputContainer
            key={label}
            title={getString(`${label}`)}
            isReadOnly={isReadOnly}
          >
            <span className="p-2.5">
              <div data-testid="firstMonthInstallment">{value}</div>
            </span>
          </InputContainer>
        ))}
      </div>
    );

  return (
    <SectionWrapper
      summary={getString('carepay.changeOrder.paidPaymentDetails')}
      details={renderPaymentDetails()}
      hideBadge
      testId="paid-payment-details-container"
      headerTestId="paid-payment-details-section"
    />
  );
}

export default PaidPaymentDetailsSection;
