import { Form, useFormikContext } from 'formik';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ChargeResponse } from 'data/slices/transactionSlice/interface';
import CustomerInformationSection from 'presentation/components/common/CustomerInformationSection';
import PaidPaymentDetailsSection from 'presentation/components/common/PaidPaymentDetailsSection';
import PaymentDetailsSection from 'presentation/components/common/PaymentDetailsSection';
import PaymentSelectionSection from 'presentation/components/common/PaymentSelectionSection';
import ActionPageLayout from 'presentation/layouts/ActionPageLayout';
import { getString } from 'presentation/theme/localization';
import { getPaymentMethod } from 'shared/helper/leadPaymentInformation';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import {
  LeadPaymentInformation,
  PaymentOption,
  QuoteInformation,
} from 'shared/types/lead';
import { satangToBaht } from 'utils/currency';

import QuoteDetailsSection from '../QuoteDetailsSection';
import { CreatePaymentSubmitProps } from '../types';

interface Props {
  data?: LeadPaymentInformation;
  isLoading?: boolean;
}

export const getInstallmentDetails = (data: any) =>
  data?.paymentOptions?.rabbitCareInstallment?.directDebitProviders?.find(
    (bank: { name: string }) => data?.packageDetails?.cardProvider === bank.name
  );

export const getPriceSummaryFromPaymentOption = (data: any) => {
  const installmentDetail = getInstallmentDetails(data);
  const installmentPaymentDetails = installmentDetail?.installmentPlans?.find(
    (installment: { numberOfInstallment: string }) =>
      installment.numberOfInstallment ===
      data?.packageDetails.numberOfInstallments
  );

  const priceSummary =
    installmentPaymentDetails?.paymentDetails?.[0]?.priceSummary;
  return priceSummary;
};

function CreatePaymentContent({ data, isLoading }: Readonly<Props>) {
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();

  const {
    values,
    setFieldValue,
    isValid,
    isValidating,
    isSubmitting,
    submitForm,
  } = useFormikContext<CreatePaymentSubmitProps>();

  const hasFollowingMonthInstallment = useMemo(
    () =>
      [PaymentOption.RABBIT_CARE_INSTALLMENT].includes(values.paymentOption),
    [values]
  );

  const onCreatePayment = async () => {
    try {
      await submitForm();
    } catch (e) {
      console.log(e);
    }
  };

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

  const paidCharges = useMemo(() => {
    if (data == null) return undefined;
    let paymentMethod = '';
    let paymentDate = null;
    let createTime = '';
    const latestCharges = data?.paymentDetails?.paidCharges
      .filter((charge: ChargeResponse) => charge.status === 'SUCCESSFUL')
      .sort(
        (charge1: ChargeResponse, charge2: ChargeResponse) =>
          (new Date(charge1.createTime) as unknown as number) -
          (new Date(charge2.createTime) as unknown as number)
      );

    if (latestCharges?.length > 0) {
      paymentMethod = latestCharges[0].paymentMethod;
      paymentDate = latestCharges[0].paymentDate;
      createTime = latestCharges[0].createTime;
    }

    const additionalPaymentAmount =
      data?.paymentDetails?.additionalPaymentAmount;

    return {
      paidChargesAmount: data?.paymentDetails?.paidAmount,
      referenceLeadId: data?.paymentDetails?.referenceLeadId,
      firstMonthRemainingAmount:
        data?.paymentDetails?.firstMonthRemainingAmount,
      firstMonthSurplusAmount: data?.paymentDetails?.firstMonthSurplusAmount,
      paymentMethod,
      paidPaymentDate: paymentDate ?? createTime,
      isNeedAdditionalPayment:
        latestCharges?.length > 0 &&
        additionalPaymentAmount &&
        additionalPaymentAmount >= 0,
      additionalPaymentAmount,
    };
  }, [data]);

  const quoteInformation = useMemo(() => {
    if (data == null || priceSummary == null) return undefined;

    const voluntaryPremium = data.quoteInformation
      ?.grossVoluntaryPremium as string;
    const processingFee = priceSummary?.feeAmountNoShip ?? '0';
    const discount = priceSummary.discountAmount;
    const totalPremium = priceSummary.netPremiumAmount;
    const whtAmount = priceSummary?.whtAmount;
    const { totalPremium: _totalPremiumIncorrect, ...rest } =
      data.healthQuoteInformation ?? { totalPremium: 0 };

    if (data?.packageDetails?.paymentMethod === 'DIRECT_DEBIT') {
      const directDebitPriceSummary = getPriceSummaryFromPaymentOption(data);
      if (directDebitPriceSummary) {
        return {
          ...data.quoteInformation,
          grossVoluntaryPremium: parseInt(voluntaryPremium, 10),
          processingFee: parseInt(
            directDebitPriceSummary?.processingFeeAmount ?? '0',
            10
          ),
          discount: parseInt(
            directDebitPriceSummary?.discount?.amount ?? '0',
            10
          ),
          shipmentFee: directDebitPriceSummary?.shipmentFee,
          totalPremium: parseInt(
            directDebitPriceSummary?.netPremiumAmount ?? '0',
            10
          ),
          whtAmount: whtAmount
            ? parseInt(directDebitPriceSummary?.whtAmount ?? '0', 10)
            : 0,
          ...(!data?.quoteInformation?.insurerName
            ? {
                insurerName: data?.healthQuoteInformation?.insurerName,
                ...rest,
              }
            : {}),
        } as QuoteInformation;
      }
    }

    return {
      ...data.quoteInformation,
      grossVoluntaryPremium: parseInt(voluntaryPremium, 10),
      processingFee: parseInt(processingFee, 10),
      discount: parseInt(discount, 10),
      totalPremium: parseInt(totalPremium, 10),
      whtAmount: whtAmount ? parseInt(whtAmount, 10) : 0,
      ...(!data?.quoteInformation?.insurerName
        ? { insurerName: data?.healthQuoteInformation?.insurerName, ...rest }
        : {}),
    } as QuoteInformation;
  }, [data, priceSummary]);

  /**
   * Updates the first month and following month's installment values
   */
  useEffect(() => {
    if (priceSummary == null) return;

    let nFirstMonth: number | string = priceSummary.netPremiumAmount;

    let nFollowingMonth: number | string = 0;

    if (hasFollowingMonthInstallment) {
      nFirstMonth = priceSummary.initialAmount;

      nFollowingMonth = priceSummary.subsequentAmount;
    }

    setFieldValue('followingMonth', satangToBaht(nFollowingMonth), true);

    if (paidCharges?.isNeedAdditionalPayment) {
      setFieldValue(
        'firstMonthAdditional',
        satangToBaht(
          data?.paymentDetails?.firstMonthRemainingAmount?.amount ??
            data?.paymentDetails?.firstMonthSurplusAmount?.amount ??
            ''
        ),
        true
      );
    }
    if (
      data?.healthQuoteInformation &&
      data?.packageDetails?.paymentOption === 'FULL_PAYMENT'
    ) {
      nFirstMonth =
        data?.packageDetails?.priceDetails?.priceSummary?.netPremiumAmount ?? 0; // RCL no discount
    }

    setFieldValue('firstMonth', satangToBaht(nFirstMonth), true);
  }, [setFieldValue, priceSummary, hasFollowingMonthInstallment]);

  const getAdditionalPaymentForRCB = () =>
    paidCharges?.firstMonthSurplusAmount?.amount &&
    parseFloat(
      paidCharges?.firstMonthSurplusAmount?.amount as unknown as string
    ) > 0
      ? '0'
      : paidCharges?.additionalPaymentAmount;

  return (
    <Form className="page-background">
      <ActionPageLayout
        title="Create Payment Page"
        onBackClick={() =>
          navigate(
            `${window.location.href.includes('/health') ? '/health' : ''}/leads/${leadId}`
          )
        }
        buttonDisabled={!isValid || isValidating || isSubmitting}
        onButtonClick={onCreatePayment}
        buttonText={getString('text.createPayment')}
        actionButtonTestId="create-payment-button"
      >
        {/* Body/Content */}
        <div className="w-1/4">
          <CustomerInformationSection
            isLoading={isLoading}
            data={data?.customerInformation}
          />
        </div>
        <div className="w-1/4">
          <QuoteDetailsSection
            isLoading={isLoading}
            data={quoteInformation}
            shipmentFee={
              data?.packageDetails?.priceDetails?.priceSummary?.shipmentFee
            }
          />
        </div>
        <div className="w-1/4">
          <PaymentSelectionSection
            isLoading={isLoading}
            paymentOptions={data?.paymentOptions}
            packageDetails={data?.packageDetails}
          />
        </div>
        <div className="w-1/4">
          {(!paidCharges?.isNeedAdditionalPayment ||
            hasFollowingMonthInstallment) && (
            <div>
              <PaymentDetailsSection
                isLoading={isLoading}
                isReadOnly
                hasFollowingMonthInstallment={hasFollowingMonthInstallment}
                paymentAmountLabel={
                  paidCharges?.isNeedAdditionalPayment ? 'amount' : 'firstMonth'
                }
              />
            </div>
          )}

          {[
            paidCharges?.isNeedAdditionalPayment,
            parseFloat(
              data?.paymentDetails?.availableCreditShell?.toString() ?? '0'
            ) > 0,
            parseFloat(
              data?.paymentDetails?.totalCreditUsed?.toString() ?? '0'
            ) > 0,
          ].some(Boolean) && (
            <div>
              <PaidPaymentDetailsSection
                isLoading={isLoading}
                isReadOnly
                referenceLeadId={paidCharges?.referenceLeadId}
                paidChargesAmount={paidCharges?.paidChargesAmount ?? 0}
                firstMonthRemainingAmount={
                  hasFollowingMonthInstallment
                    ? (paidCharges?.firstMonthRemainingAmount?.amount.toString() ??
                      '0')
                    : (getAdditionalPaymentForRCB() ?? '0')
                }
                firstMonthSurplusAmount={
                  paidCharges?.firstMonthSurplusAmount?.amount.toString() ?? '0'
                }
                paymentMethod={paidCharges?.paymentMethod}
                paidPaymentDate={paidCharges?.paidPaymentDate}
                availableCreditShell={
                  data?.paymentDetails?.availableCreditShell
                }
                totalCreditUsed={data?.paymentDetails?.totalCreditUsed}
              />
            </div>
          )}
        </div>
      </ActionPageLayout>
    </Form>
  );
}

export default CreatePaymentContent;
