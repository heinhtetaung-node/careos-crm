import { useLazyGetPricingPaymentOptionsQuery } from 'data/slices/discountAndPricingSlice';
import { LANGUAGES, getLanguage } from 'presentation/theme/localization';

import {
  formatFullPaymentData,
  formatRabbitCareInstallmentData,
  formatCreditCardInstallmentData,
  formatDebitCardInstallmentData,
} from './helper';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

function usePaymentInformation() {
  const currentLocale = getLanguage();

  const featureFlags = useFlags([
    FeatureFlags.BROK_1778_SHOW_DIRECT_DEBIT_20250210_TEMP,
    FeatureFlags.BROK_1838_ENABLE_CREDIT_TERM_PAYMENT_OPTIONS_CAREPAY_20250523,
  ]);

  const showDirectDebit =
    featureFlags[FeatureFlags.BROK_1778_SHOW_DIRECT_DEBIT_20250210_TEMP]
      ?.enabled ?? false;

  const enableCreditTermOption =
    featureFlags[
      FeatureFlags.BROK_1838_ENABLE_CREDIT_TERM_PAYMENT_OPTIONS_CAREPAY_20250523
    ]?.enabled ?? false;

  const [getPaymentOptions, { data, ...status }] =
    useLazyGetPricingPaymentOptionsQuery();

  // Filter out CREDIT_TERM payment method if enableCreditTermOption is false
  const filteredFullPayment = data?.paymentOptions?.fullPayment
    ? {
        ...data.paymentOptions.fullPayment,
        paymentDetails: data.paymentOptions.fullPayment.paymentDetails?.filter(
          (detail: any) =>
            enableCreditTermOption || detail.paymentMethod !== 'CREDIT_TERM'
        ),
      }
    : undefined;

  return {
    getPaymentOptions,
    status,
    data: {
      fullPayment: filteredFullPayment
        ? formatFullPaymentData('fullPayment', filteredFullPayment)
        : undefined,
      rabbitCareInstallment: data?.paymentOptions?.rabbitCareInstallment
        ? formatRabbitCareInstallmentData(
            'rabbitCareInstallment',
            data.paymentOptions.rabbitCareInstallment,
            showDirectDebit
          )
        : undefined,
      directDebitInstallment:
        data?.paymentOptions?.rabbitCareInstallment?.directDebitProviders &&
        showDirectDebit
          ? formatDebitCardInstallmentData(
              'directDebitInstallment',
              {
                packagePrice:
                  data?.paymentOptions?.rabbitCareInstallment?.packagePrice,
                cardProviders:
                  data?.paymentOptions?.rabbitCareInstallment
                    ?.directDebitProviders,
              },
              currentLocale as LANGUAGES
            )
          : undefined,
      creditCardInstallment: data?.paymentOptions?.creditCardInstallment
        ? formatCreditCardInstallmentData(
            'creditCardInstallment',
            data.paymentOptions.creditCardInstallment,
            currentLocale as LANGUAGES
          )
        : undefined,
    },
  };
}

export default usePaymentInformation;
