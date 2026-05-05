import React, { useMemo } from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import StatusDialog from 'presentation/components/common/StatusDialog';
import { getString } from 'presentation/theme/localization';
import { CommonSelectOption } from 'shared/types/lead';
import { insuranceTypeCollection } from 'shared/constants/packageStaticData';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { CircularProgress } from '@material-ui/core';
import { useGetContractQuery } from 'data/slices/leadDetailSlices/contractHistorySlice';

function ContractDetailPopup({
  isOpen,
  setIsOpen,
  openedContract,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openedContract: any;
}) {
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const showDetail = (fields: CommonSelectOption[]) => (
    <div className="w-full flex flex-wrap text-left">
      {fields.map(({ label, value }) => (
        <InputContainer title={getString(label)} isReadOnly>
          <span className="p-2.5 flex" data-testid="lead-id">
            {value}
          </span>
        </InputContainer>
      ))}
    </div>
  );

  const convertInsuranceType = (type: string) => {
    const findType = insuranceTypeCollection().find(
      (item) => item.packageValue === type
    );
    if (findType) {
      return findType.value;
    }
    return '';
  };

  const isHealthProduct = useMemo(
    () => globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct]
  );

  const { data: contractDetail, isLoading } = useGetContractQuery(
    { contractId: openedContract?.configId },
    { skip: !openedContract?.configId || !isHealthProduct }
  );

  const restInsuranceInfo = useMemo(() => {
    if (isHealthProduct) {
      return [
        {
          label: 'leadDetailFields.productCategory',
          value: getString(
            `healthPackageDetail.categories.${(contractDetail as any)?.healthPackage?.packageCategory}`
          ),
        },
      ];
    }
    return [
      {
        label: 'leadDetailFields.licensePlate',
        value: openedContract?.licensePlate,
      },
      {
        label: 'leadDetailFields.insuranceType',
        value: convertInsuranceType(openedContract?.insuranceType),
      },
    ];
  }, [isHealthProduct, openedContract, isLoading, contractDetail]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <StatusDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={
        <div className="mt-4 h-auto flex">
          <div className="w-1/3 flex p-1">
            <SectionWrapper
              summary={getString('paymentDetails.customerInformation')}
              details={showDetail([
                {
                  label: 'text.leadId',
                  value: openedContract?.leadId,
                },
                {
                  label: 'leadDetailFields.nationalIdPassport',
                  value: openedContract?.nationId,
                },
                {
                  label: 'carepay.contract.insuredPersonName',
                  value: openedContract?.policyHolderFullName,
                },
                {
                  label: 'carepay.contract.customerName',
                  value: openedContract?.customerName,
                },
                {
                  label: 'leadDetailFields.email',
                  value: openedContract?.email,
                },
                // {
                //   label: 'text.address',
                //   value: openedContract?.address,
                // },
                {
                  label: 'carepay.contract.assignedQC',
                  value: openedContract?.assignedQC,
                },
              ])}
              testId="customer-information-container"
              headerTestId="customer-information-section"
            />
          </div>
          <div className="w-1/3 flex p-1 h-full">
            <SectionWrapper
              summary={getString('carepay.contract.insuranceInformation')}
              details={showDetail([
                {
                  label: 'paymentDetails.insurerName',
                  value: openedContract?.insurer,
                },
                {
                  label: 'carepay.contract.policyStartDate',
                  value: openedContract?.policyStartDate,
                },
                {
                  label: 'carepay.contract.policyEndDate',
                  value: openedContract?.policyEndDate,
                },
                ...restInsuranceInfo,
              ])}
              testId="customer-information-container"
              headerTestId="customer-information-section"
            />
          </div>
          <div className="w-1/3 flex p-1 h-full">
            <SectionWrapper
              summary={getString('carepay.contract.paymentInformation')}
              details={showDetail([
                {
                  label: 'paymentDetails.installmentPlan',
                  value: openedContract?.installments,
                },
                {
                  label: 'paymentDetails.totalPremium',
                  value: openedContract?.installmentAmount,
                },
                {
                  label:
                    'paymentDetails.installmentDetails.firstMonthInstallment',
                  value: openedContract?.firstInstallment,
                },
                {
                  label:
                    'paymentDetails.installmentDetails.firstInstallmentDate',
                  value: openedContract?.firstInstallmentDate,
                },
              ])}
              testId="customer-information-container"
              headerTestId="customer-information-section"
            />
          </div>
        </div>
      }
      id="contract-information"
      maxWidth="xl"
      blueTitle={getString('carepay.contract.contractInformation')}
    />
  );
}

export default ContractDetailPopup;
