import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import _get from 'lodash/get';
import _snakeCase from 'lodash/snakeCase';
import { object, string, number } from 'yup';

import { getString, LANGUAGES } from 'presentation/theme/localization';
import { generateErrorMessage } from 'shared/helper/ErrorHelper';
import { InstallmentPlanV2, PaymentOptions } from 'shared/types/lead';
import { PriceSummary } from 'shared/types/packages';

import { DiscountType } from './Discount/helper';
import { CreditCardInstallment } from './interface';

const validationSchema = object().shape({
  discountType: string().notRequired(),
  campaignName: string().notRequired(),
  discountPercentage: number().notRequired(),
  paymentMethod: string().required(),
  paymentOption: string().required(),
  numberOfInstallment: number().required(),
  cardProvider: string().notRequired().nullable(),
  deliveryOption: string().notRequired().nullable(), // change to required when we fully implement the delivery option feature.
});

function getFieldValue(
  paymentOption: string,
  paymentMethod: string,
  numberOfInstallment: number,
  detail: PriceSummary,
  cardProvider: string | null = null
) {
  if (paymentOption === 'fullPayment') {
    return {
      initialAmount: detail.initialAmount,
      subsequentAmount: detail.subsequentAmount,
      feeAmount: parseFloat(detail.feeAmount) > 0 ? detail?.feeAmount : '0',
      discountAmount:
        parseFloat(detail.discountAmount) > 0 ? -detail?.discountAmount : '0',
      discountRate: detail.discountRate > 0 ? -detail?.discountRate : 0,
      netPremiumAmount: detail?.netPremiumAmount,
      discountType: detail?.discount?.type ?? '',
      paymentMethod,
      paymentOption: _snakeCase(paymentOption).toUpperCase(),
      installment: numberOfInstallment,
      issuingBank: cardProvider,
      discount: detail.discount,
    };
  }
  return {
    initialAmount: detail.initialAmount,
    subsequentAmount: detail.subsequentAmount,
    feeAmount: parseFloat(detail.feeAmount) > 0 ? detail?.feeAmount : '0',
    discountAmount:
      parseFloat(detail.discountAmount) > 0 ? -detail?.discountAmount : '0',
    discountRate: detail.discountRate > 0 ? -detail?.discountRate : 0,
    netPremiumAmount: detail?.netPremiumAmount,
    discountType: detail?.discount?.type ?? '',
    paymentMethod,
    paymentOption: _snakeCase(paymentOption).toUpperCase(),
    installment: numberOfInstallment,
    issuingBank: cardProvider,
    discount: detail.discount,
  };
}

function formatFullPaymentData(
  key: string,
  data: PaymentOptions['fullPayment']
) {
  const fullTimePaymentOptions: any = [];
  data?.paymentDetails.forEach((option) => {
    fullTimePaymentOptions.push(
      getFieldValue('fullPayment', option.paymentMethod, 1, option.priceSummary)
    );
  });

  return {
    name: key,
    options: fullTimePaymentOptions,
  };
}

function formatRabbitCareInstallmentData(
  key: string,
  data: PaymentOptions['rabbitCareInstallment'],
  showDirectDebit: boolean = false
) {
  const paymentMethods: string[] = [];
  const paymentInfos: any = {};
  data?.installmentPlans.forEach((plan) => {
    plan.paymentDetails.forEach((detail) => {
      if (detail?.paymentMethod === 'DIRECT_DEBIT' && !showDirectDebit) {
        return;
      }
      if (!paymentMethods.includes(detail.paymentMethod)) {
        paymentMethods.push(detail.paymentMethod);
        paymentInfos[detail.paymentMethod] = [
          getFieldValue(
            key,
            detail.paymentMethod,
            plan.numberOfInstallment,
            detail.priceSummary
          ),
        ];
      } else {
        paymentInfos[detail.paymentMethod].push(
          getFieldValue(
            key,
            detail.paymentMethod,
            plan.numberOfInstallment,
            detail.priceSummary
          )
        );
      }
    });
  });
  const cashInstallmentOptions = paymentMethods.map((name) => ({
    name,
    options: paymentInfos[name],
  }));

  return {
    name: key,
    options: cashInstallmentOptions,
  };
}

function formatCardInfo(
  paymentType: string,
  issuingBank: string,
  installmentPlans: InstallmentPlanV2[]
) {
  const paymentMethods: string[] = [];
  const paymentInfos: any = {};
  installmentPlans.forEach((plan) => {
    plan.paymentDetails.forEach((detail) => {
      if (!paymentMethods.includes(detail.paymentMethod)) {
        paymentMethods.push(detail.paymentMethod);
        paymentInfos[detail.paymentMethod] = [
          getFieldValue(
            paymentType,
            detail.paymentMethod,
            plan.numberOfInstallment,
            detail.priceSummary,
            issuingBank
          ),
        ];
      } else {
        paymentInfos[detail.paymentMethod].push(
          getFieldValue(
            paymentType,
            detail.paymentMethod,
            plan.numberOfInstallment,
            detail.priceSummary,
            issuingBank
          )
        );
      }
    });
  });
  return paymentMethods.map((name) => ({
    name,
    options: paymentInfos[name],
  }));
}

function formatCreditCardInstallmentData(
  key: string,
  data: PaymentOptions['creditCardInstallment'],
  currentLocale: LANGUAGES
) {
  const paymentInfos: CreditCardInstallment['cards'] = {};
  const cardProviders: CreditCardInstallment['cardProviders'] = [];
  data?.cardProviders.forEach((card) => {
    cardProviders.push({
      shortName: card.shortName,
      displayName:
        currentLocale === 'en' ? card.displayNameEn : card.displayNameTh,
      name: card.name,
    });
    paymentInfos[card.name] = formatCardInfo(
      key,
      card.name,
      card.installmentPlans
    );
  });

  return {
    name: key,
    cards: paymentInfos,
    cardProviders,
  };
}

function formatDebitCardInstallmentData(
  key: string,
  data: PaymentOptions['creditCardInstallment'],
  currentLocale: LANGUAGES
) {
  const paymentInfos: CreditCardInstallment['cards'] = {};
  const cardProviders: CreditCardInstallment['cardProviders'] = [];
  data?.cardProviders.forEach((card) => {
    cardProviders.push({
      shortName: card.shortName,
      displayName:
        currentLocale === 'en' ? card.displayNameEn : card.displayNameTh,
      name: card.name,
    });
    paymentInfos[card.name] = formatCardInfo(
      key,
      card.name,
      card.installmentPlans
    );
  });

  return {
    name: key,
    cards: paymentInfos,
    cardProviders,
  };
}

export {
  validationSchema,
  formatFullPaymentData,
  formatRabbitCareInstallmentData,
  formatDebitCardInstallmentData,
  formatCreditCardInstallmentData,
  formatCardInfo,
  getFieldValue,
};

export const requestRequiredDiscountType = [
  DiscountType.agentDiscount,
  DiscountType.campaignDiscount,
  DiscountType.matchPrice,
] as string[];

export const checkRequireDiscountRequest = ({
  discountType,
  approver,
  maxDiscount = 0,
  requestedDiscount = 0,
}: {
  discountType: string;
  approver?: string;
  maxDiscount?: number;
  requestedDiscount?: number;
}) => {
  if (!requestRequiredDiscountType.includes(discountType)) {
    return false;
  }
  switch (discountType) {
    case DiscountType.agentDiscount:
      return requestedDiscount > maxDiscount;
    case DiscountType.campaignDiscount:
      return approver !== '-' && approver !== undefined && approver !== '';
    case DiscountType.matchPrice:
    default:
      return true;
  }
};

export const getFormattedError = (
  error: FetchBaseQueryError | SerializedError
) => {
  const errorResponse: any = _get(error, 'data.details');
  const normalErrorResponse: any = _get(error, 'data');
  const errorArray = errorResponse?.length
    ? errorResponse.map((response: any) => generateErrorMessage(response))
    : [
        normalErrorResponse?.message ??
          getString('errorMessage.generalErrorMessage'),
      ];
  return errorArray;
};

export const updateEligibleVoucherInformation = (
  payload: any,
  voucherEligibility: any,
  isEVoucherEligible: boolean
) => ({
  ...payload,
  voucherEligibility: {
    ...voucherEligibility,
    eligible: isEVoucherEligible,
  },
});
