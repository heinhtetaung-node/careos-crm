/**
 * Convenience functions to return information from a LeadPaymentInformation object
 */

import { PaymentOptions } from 'shared/types/lead';

/**
 * Takes in a payment options object and returns an organized set of keys to index
 * the object with.
 */
export const sortPaymentOptionKeys = (paymentOptions: PaymentOptions) => {
  const paymentOrder: (keyof PaymentOptions)[] = [
    'fullPayment',
    'creditCardInstallment',
    'rabbitCareInstallment',
  ];

  const availableKeys = Object.keys(paymentOptions);

  return paymentOrder.filter((key) => availableKeys.includes(key as string));
};

/**
 * Returns a lead's payment details from the payment option object.
 */
export const getPaymentDetails = (
  paymentOptions: PaymentOptions,
  paymentOption = 0,
  issuingBank = 0,
  installmentPlan = 0,
  paymentMethod: string | null = null,
  cardProvider: string | null = null
) => {
  let currPaymentOption = paymentOptions[
    sortPaymentOptionKeys(paymentOptions)[paymentOption]
  ] as any;

  if (paymentMethod === 'DIRECT_DEBIT') {
    currPaymentOption = currPaymentOption?.directDebitProviders?.find(
      (obj: { name: string }) => obj.name === cardProvider
    );
  }

  if (currPaymentOption == null) return null;

  if ('paymentDetails' in currPaymentOption) {
    return currPaymentOption.paymentDetails;
  }
  if ('availablePlans' in currPaymentOption) {
    return currPaymentOption.installmentPlans[installmentPlan].paymentDetails;
  }
  return currPaymentOption.cardProviders[issuingBank].installmentPlans[
    installmentPlan
  ].paymentDetails;
};

/**
 * Returns a lead's payment method from the payment option object.
 */
export const getPaymentMethod = (
  paymentOptions: PaymentOptions,
  paymentOption = 0,
  paymentMethod = 0,
  issuingBank = 0,
  installmentPlan = 0
) => {
  const currPaymentOption =
    paymentOptions[sortPaymentOptionKeys(paymentOptions)[paymentOption]];

  const paymentDetails = getPaymentDetails(
    paymentOptions,
    paymentOption,
    issuingBank,
    installmentPlan
  );

  if (currPaymentOption == null || paymentDetails == null) return null;

  return paymentDetails[paymentMethod];
};
