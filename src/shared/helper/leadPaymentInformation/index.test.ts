import { mockPaymentOptions } from 'mock-data/LeadPaymentInformation';
import { PaymentOption } from 'shared/types/lead';

import { getPaymentDetails, getPaymentMethod, sortPaymentOptionKeys } from '.';

describe('sortPaymentOptionKeys', () => {
  it('should return a sorted array of keys', () => {
    const result = sortPaymentOptionKeys(mockPaymentOptions);

    expect(result).toEqual([
      'fullPayment',
      'creditCardInstallment',
      'rabbitCareInstallment',
    ]);
  });
});

describe('getPaymentDetails', () => {
  it.each([
    'FULL_PAYMENT',
    'CREDIT_CARD_INSTALLMENT',
    'RABBIT_CARE_INSTALLMENT',
  ])('should return payment option for %s', (paymentOption) => {
    const index = PaymentOption[paymentOption as keyof typeof PaymentOption];
    const result = getPaymentDetails(mockPaymentOptions, index);

    expect(result).not.toBeNull();
    expect(result?.length).toBeGreaterThan(0);
  });

  it('should return the first index if optional props are not provided', () => {
    const result = getPaymentDetails(mockPaymentOptions);

    expect(result).not.toBeNull();
    expect(result?.[0]).toEqual(
      mockPaymentOptions.fullPayment?.paymentDetails[0]
    );
  });
});

describe('getPaymentMethod', () => {
  it.each([
    'FULL_PAYMENT',
    'CREDIT_CARD_INSTALLMENT',
    'RABBIT_CARE_INSTALLMENT',
  ])('should return payment option for %s', (paymentOption) => {
    const index = PaymentOption[paymentOption as keyof typeof PaymentOption];
    const result = getPaymentMethod(mockPaymentOptions, index);

    expect(result).not.toBeNull();
    expect(result?.paymentMethod).toEqual('QR_CODE');
  });

  it('should return the first index if optional props are not provided', () => {
    const result = getPaymentMethod(mockPaymentOptions);

    expect(result).not.toBeNull();
    expect(result).toEqual(mockPaymentOptions.fullPayment?.paymentDetails[0]);
  });
});
