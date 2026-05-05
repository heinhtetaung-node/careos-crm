import { useField } from 'formik';
import React from 'react';

import DetailViewDatepicker from 'presentation/components/common/FormikFields/DetailViewDatepicker';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import { formatAmountToDecimal } from 'presentation/components/common/InfoPanel/Insurance/Insurance.helper';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { QuoteInformation } from 'shared/types/lead';
import { satangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

interface Props {
  isLoading?: boolean;
  data?: QuoteInformation;
}

interface QuoteDetailProps {
  title: string;
  key: keyof QuoteInformation;
  isNum?: boolean;
  isDate?: boolean;
  value?: string;
}
const healthQuoteDetails: QuoteDetailProps[] = [
  {
    key: 'insurerName',
    title: getString('paymentDetails.insurerName'),
  },
  {
    key: 'productCategory',
    title: getString('healthPackage.productCategory'),
    value: 'healthPackageDetail.categories',
  },
  {
    key: 'productName',
    title: getString('healthPackage.productName'),
  },
  {
    key: 'premium',
    title: getString('healthPackage.grossPremium'),
    isNum: true,
  },
  {
    key: 'processingFee',
    title: getString('paymentDetails.processingFee'),
    isNum: true,
  },
  {
    key: 'deliveryFee',
    title: getString('paymentDetails.deliveryFee'),
    isNum: true,
  },
  {
    key: 'discount',
    title: getString('paymentDetails.discount'),
    isNum: true,
  },
  {
    key: 'totalPremium',
    title: getString('paymentDetails.totalPremium'),
    isNum: true,
  },
  {
    key: 'startDate',
    title: getString('paymentDetails.coverageDetails.startDate'),
    isDate: true,
  },
  {
    key: 'endDate',
    title: getString('paymentDetails.coverageDetails.endDate'),
    isDate: true,
  },
];
function QuoteDetailsSection({ isLoading, data }: Readonly<Props>) {
  const [field, , helper] = useField('endDate');
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const renderQuoteDetails = () => {
    if (isLoading || data == null)
      return (
        <div className="h-96">
          <Spinner />
        </div>
      );
    if (globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
      return (
        <div className="w-full flex flex-wrap">
          {healthQuoteDetails.map(({ key, title, isNum, value, isDate }) => {
            let fieldValue = data[key];

            if (isNum) {
              fieldValue = formatAmountToDecimal(satangToBaht(data[key] || 0));
            } else if (isDate) {
              fieldValue = data[key]
                ? format(new Date(data[key]), 'dd/MM/yyyy')
                : '';
            } else if (value) {
              fieldValue = getString(`${value}.${data[key]}`);
            }

            return (
              <InputContainer key={key} title={title} isReadOnly>
                <span className="p-2.5 flex" data-testid={key}>
                  {fieldValue}
                </span>
              </InputContainer>
            );
          })}
        </div>
      );
    }

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
        <InputContainer
          title={getString('paymentDetails.voluntaryType')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="voluntary-type">
            {data.insuranceType}
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
          subText={getString('paymentDetails.discountIncluded')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="voluntary-premium">
            {formatAmountToDecimal(
              satangToBaht(data.grossVoluntaryPremium || 0)
            )}
          </span>
        </InputContainer>
        {data.processingFee != null && (
          <InputContainer
            title={getString('paymentDetails.processingFee')}
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="voluntary-premium">
              {formatAmountToDecimal(satangToBaht(data.processingFee))}
            </span>
          </InputContainer>
        )}
        {data.totalPremium && (
          <InputContainer
            title={getString('paymentDetails.totalPremium')}
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="total-premium">
              {formatAmountToDecimal(satangToBaht(data.totalPremium))}
            </span>
          </InputContainer>
        )}
        <InputContainer
          title={getString('paymentDetails.coverageDetails.startDate')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="start-coverage-date">
            {data?.startDate
              ? format(new Date(data.startDate), 'dd/MM/yyyy')
              : ''}
          </span>
        </InputContainer>
        <InputContainer
          title={getString('paymentDetails.coverageDetails.endDate')}
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="end-coverage-date">
            {data?.endDate ? format(new Date(data.endDate), 'dd/MM/yyyy') : ''}
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
