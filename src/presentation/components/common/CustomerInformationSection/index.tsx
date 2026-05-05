import React from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { CustomerInformation } from 'shared/types/lead';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getAgeByBirthday } from '@careos/utils';

interface Props {
  isLoading?: boolean;
  data?: CustomerInformation;
}

function CustomerInformationSection({ isLoading, data }: Props) {
  const lead = useGetLeadSelector();
  const renderCustomerInformation = () => {
    return isLoading || data == null ? (
      <div className="h-72">
        <Spinner />
      </div>
    ) : (
      <div className="w-full flex flex-wrap">
        <InputContainer title={getString('text.leadId')} isReadOnly>
          <span className="p-2.5 flex" data-testid="lead-id">
            {data.humanId}
          </span>
        </InputContainer>
        {data.orderType && (
          <InputContainer
            title={getString('paymentDetails.orderType')}
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="order-type">
              {data.orderType}
            </span>
          </InputContainer>
        )}

        {data.policyHolderType && (
          <InputContainer
            title={
              data.policyHolderType === 'company'
                ? getString('paymentDetails.company.taxId')
                : getString('paymentDetails.policyHolder.idCard')
            }
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="policy-holder-id-card">
              {data.customerId}
            </span>
          </InputContainer>
        )}
        <InputContainer
          title={
            data.policyHolderType === 'company'
              ? getString('paymentDetails.company.name')
              : getString('paymentDetails.policyHolder.name')
          }
          isReadOnly
        >
          <span className="p-2.5 flex" data-testid="policy-holder-name">
            {data.customerName}
          </span>
        </InputContainer>

        {data.policyAddress && (
          <InputContainer
            title={getString('paymentDetails.policyHolder.address')}
            isReadOnly
          >
            <span className="p-2.5 flex" data-testid="policy-address">
              {data.policyAddress}
            </span>
          </InputContainer>
        )}
        {data.email && (
          <InputContainer title={getString('text.email')} isReadOnly>
            <span className="p-2.5 flex" data-testid="email">
              {data.email}
            </span>
          </InputContainer>
        )}
        {data.phoneNumber && (
          <InputContainer title={getString('text.phoneNumber')} isReadOnly>
            <span className="p-2.5 flex" data-testid="phone-number">
              {data.phoneNumber}
            </span>
          </InputContainer>
        )}
        {lead.product === 'products/health-insurance' && (
          <InputContainer title={getString('healthPackage.age')} isReadOnly>
            <span className="p-2.5 flex" data-testid="phone-number">
              {getAgeByBirthday((lead?.data as any)?.policyHolder?.dob)}
            </span>
          </InputContainer>
        )}
      </div>
    );
  };

  return (
    <SectionWrapper
      summary={getString('paymentDetails.customerInformation')}
      details={renderCustomerInformation()}
      hideBadge
      testId="customer-information-container"
      headerTestId="customer-information-section"
    />
  );
}

export default CustomerInformationSection;
