import React from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import { formatAmountToDecimal } from 'presentation/components/common/InfoPanel/Insurance/Insurance.helper';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { QuoteInformation } from 'shared/types/lead';
import { satangToBaht } from 'utils/currency';

interface Props {
  isLoading?: boolean;
  data?: QuoteInformation;
  shipmentFee?: string;
}

function QuoteDetailsSection({ isLoading, data, shipmentFee }: Props) {
  const insuranceType = data?.insuranceType;

  const renderQuoteDetails = () => {
    if (isLoading || data == null)
      return (
        <div className="h-72">
          <Spinner />
        </div>
      );
    return (
      <div className="w-full flex flex-wrap">
        <InputContainer
          title={getString('paymentDetails.insurerName')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="insurer-name">
            {data.insurerName}
          </span>
        </InputContainer>
        {!data?.productCategory ? ( // car product doesn't have product category
          <>
            <InputContainer
              title={getString('paymentDetails.voluntaryType')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="voluntary-type">
                {[
                  'INSURANCE_TYPES_UNSPECIFIED',
                  'INSURANCE_TYPE_MANDATORY',
                ].includes(insuranceType ?? '')
                  ? '-'
                  : (insuranceType ?? '-')}
              </span>
            </InputContainer>
            <InputContainer
              title={getString('paymentDetails.mandatoryType')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="mandatory-type">
                {data.insuranceKind !== 'VOLUNTARY'
                  ? getString('text.yes')
                  : getString('text.no')}
              </span>
            </InputContainer>
            <InputContainer title={getString('text.licensePlate')} isReadOnly>
              <span className="p-2.5 flex" data-testid="license-plate">
                {data.licensePlate}
              </span>
            </InputContainer>
            <InputContainer title={getString('text.car')} isReadOnly>
              <span className="p-2.5 flex" data-testid="car">
                {data.car}
              </span>
            </InputContainer>
            <InputContainer
              title={getString('paymentDetails.voluntaryPremium')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="voluntary-premium">
                {formatAmountToDecimal(
                  satangToBaht(data.grossVoluntaryPremium || 0)
                )}
              </span>
            </InputContainer>
            <InputContainer
              title={getString('paymentDetails.mandatoryPremium')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="mandatory-premium">
                {formatAmountToDecimal(
                  satangToBaht(data.grossMandatoryPremium || 0)
                )}
              </span>
            </InputContainer>
          </>
        ) : (
          <>
            <InputContainer
              title={getString('healthPackage.productCategory')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="car">
                {getString(
                  `healthPackageFilter.productCategoryValue.${data?.productCategory}`
                )}
              </span>
            </InputContainer>
            <InputContainer
              title={getString('healthPackage.productName')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="car">
                {data?.productName}
              </span>
            </InputContainer>
            <InputContainer
              title={getString('healthPackage.grossPremium')}
              isReadOnly
            >
              <span className="p-2.5 flex" data-testid="car">
                {formatAmountToDecimal(satangToBaht(data?.premium ?? 0))}
              </span>
            </InputContainer>
          </>
        )}
        <InputContainer
          title={getString('paymentDetails.processingFee')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="payment-fee">
            {formatAmountToDecimal(satangToBaht(data.processingFee || 0))}
          </span>
        </InputContainer>
        <InputContainer
          title={getString('paymentDetails.deliveryFee')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="delivery-fee">
            {formatAmountToDecimal(satangToBaht(shipmentFee ?? 0))}
          </span>
        </InputContainer>
        <InputContainer title={getString('paymentDetails.discount')} isReadOnly>
          <span className="p-2.5 flex" data-testid="discount">
            {formatAmountToDecimal(satangToBaht(data.discount || 0))}
          </span>
        </InputContainer>
        {!data?.productCategory && (
          <InputContainer
            title={getString('carepay.changeOrder.withHoldingTax')}
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="wth-amount">
              {formatAmountToDecimal(satangToBaht(data.whtAmount || 0))}
            </span>
          </InputContainer>
        )}
        <InputContainer
          title={getString('paymentDetails.totalPremium')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="total-premium">
            {formatAmountToDecimal(satangToBaht(data.totalPremium || 0))}
          </span>
        </InputContainer>
      </div>
    );
  };

  return (
    <SectionWrapper
      summary={getString('paymentDetails.quoteDetails')}
      details={renderQuoteDetails()}
      hideBadge
      testId="quote-details-container"
      headerTestId="quote-details-section"
    />
  );
}

export default QuoteDetailsSection;
