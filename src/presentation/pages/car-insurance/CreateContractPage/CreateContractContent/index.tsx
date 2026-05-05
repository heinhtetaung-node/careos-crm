import { Form, useFormikContext } from 'formik';
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import CustomerInformationSection from 'presentation/components/common/CustomerInformationSection';
import PaymentDetailsSection from 'presentation/components/common/PaymentDetailsSection';
import PaymentSelectionSection from 'presentation/components/common/PaymentSelectionSection';
import ActionPageLayout from 'presentation/layouts/ActionPageLayout';
import { getString } from 'presentation/theme/localization';
import { getPaymentMethod } from 'shared/helper/leadPaymentInformation';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { LeadPaymentInformation } from 'shared/types/lead';
import { satangToBaht } from 'utils/currency';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

import QuoteDetailsSection from '../QuoteDetailsSection';
import { CreateContractSubmitProps } from '../types';
import { getPriceSummaryFromPaymentOption } from '../../CreatePaymentPage/CreatePaymentContent';

interface Props {
  data?: LeadPaymentInformation;
  isLoading?: boolean;
}

function CreateContractContent({ data, isLoading }: Props) {
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();

  const {
    values,
    setFieldValue,
    isValid,
    isValidating,
    isSubmitting,
    submitForm,
  } = useFormikContext<CreateContractSubmitProps>();
  const flags = useFlags([
    FeatureFlags.BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP,
  ]);
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const enableHealthPaymentFlow =
    flags[FeatureFlags.BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP];

  const priceSummary = useMemo(() => {
    if (data == null) return undefined;

    return (
      getPaymentMethod(
        data.paymentOptions,
        values.paymentOption,
        values.paymentMethod,
        values.issuingBank,
        values.installmentPlan
      )?.priceSummary ?? undefined
    );
  }, [data, values]);

  const quoteInformation = useMemo(() => {
    if (data == null || priceSummary == null) return undefined;

    const currPaymentOption = data.paymentOptions.rabbitCareInstallment;

    if (currPaymentOption == null) return undefined;

    const voluntaryPremium = priceSummary.packagePriceAfterDiscount;
    const processingFee = priceSummary.feeAmount;
    const totalPremium = priceSummary.netPremiumAmount;
    const endDate = data?.carQuoteInformation?.endDate;

    setFieldValue('endDate', new Date(endDate), true);

    let priceSummaryForDebit;
    if (data?.packageDetails?.paymentMethod === 'DIRECT_DEBIT') {
      priceSummaryForDebit = getPriceSummaryFromPaymentOption(data);
    }
    return {
      ...(data?.carQuoteInformation || data?.healthQuoteInformation),
      grossVoluntaryPremium: parseInt(voluntaryPremium, 10),
      processingFee: parseInt(
        priceSummaryForDebit?.processingFeeAmount || processingFee,
        10
      ),
      totalPremium: parseInt(
        priceSummaryForDebit?.netPremiumAmount || totalPremium,
        10
      ),
    };
  }, [data, priceSummary]);

  useEffect(() => {
    if (priceSummary == null) return;

    const nFirstMonth = priceSummary.initialAmount;

    const nFollowingMonth = priceSummary.subsequentAmount;

    setFieldValue('firstMonth', satangToBaht(nFirstMonth), true);
    setFieldValue('followingMonth', satangToBaht(nFollowingMonth), true);
  }, [data, values, setFieldValue, priceSummary]);

  const isHealthProduct = useMemo(
    () =>
      enableHealthPaymentFlow &&
      globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct, enableHealthPaymentFlow]
  );

  return (
    <Form className="page-background">
      <ActionPageLayout
        title="Create Contract Page"
        onBackClick={() =>
          navigate(
            isHealthProduct ? `/health/leads/${leadId}` : `/leads/${leadId}`
          )
        }
        buttonDisabled={!isValid || isValidating || isSubmitting}
        buttonText={getString('text.createContract')}
        onButtonClick={submitForm}
        actionButtonTestId="create-contract-button"
      >
        <div className="w-1/4">
          <CustomerInformationSection
            isLoading={isLoading}
            data={data?.customerInformation}
          />
        </div>
        <div className="w-1/4">
          <QuoteDetailsSection isLoading={isLoading} data={quoteInformation} />
        </div>
        <div className="w-1/4">
          <PaymentSelectionSection
            isLoading={isLoading}
            paymentOptions={data?.paymentOptions}
            packageDetails={data?.packageDetails}
          />
        </div>
        <div className="w-1/4">
          <PaymentDetailsSection
            isLoading={isLoading}
            mandatoryNotIncluded
            isReadOnly
            hasFollowingMonthInstallment
          />
        </div>
      </ActionPageLayout>
    </Form>
  );
}

export default CreateContractContent;
