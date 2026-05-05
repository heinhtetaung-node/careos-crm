import mockPaymentOptions from '@alphafounders/mock-data/json/paymentOptions.json';

import { LANGUAGES } from 'presentation/theme/localization';
import { PaymentOptions } from 'shared/types/lead';

import {
  getFieldValue,
  formatFullPaymentData,
  formatRabbitCareInstallmentData,
  formatCreditCardInstallmentData,
  checkRequireDiscountRequest,
  getFormattedError,
  updateEligibleVoucherInformation,
} from './helper';

describe('getFieldValue', () => {
  it('returns formatted data when paymentType is fullPayment ', () => {
    expect(
      getFieldValue('fullPayment', 'QR_CODE', 1, {
        initialAmount: '100000',
        subsequentAmount: '0',
        feeAmount: '150000',
        discountAmount: '12345',
        discountRate: 200,
        netPremiumAmount: '100000',
        discount: null,
      } as any)
    ).toEqual(
      expect.objectContaining({
        discountAmount: -12345,
        discountRate: -200,
        feeAmount: '150000',
        discountType: '',
        initialAmount: '100000',
        installment: 1,
        issuingBank: null,
        netPremiumAmount: '100000',
        paymentOption: 'FULL_PAYMENT',
        paymentMethod: 'QR_CODE',
        subsequentAmount: '0',
        discount: null,
      })
    );
  });
});

describe('formatFullPaymentData', () => {
  it('returns formatted full payment data', () => {
    expect(
      formatFullPaymentData(
        'fullPayment',
        mockPaymentOptions.paymentOptions
          .fullPayment as unknown as PaymentOptions['fullPayment']
      )
    ).toEqual(
      expect.objectContaining({
        name: 'fullPayment',
        options: [
          {
            discount: {
              amount: '6105',
              percentage: 33,
              type: 'car_discount',
            },
            discountAmount: -6105,
            discountRate: -0.33,
            discountType: 'car_discount',
            feeAmount: '0',
            initialAmount: '0',
            installment: 1,
            issuingBank: null,
            netPremiumAmount: '1908416',
            paymentOption: 'FULL_PAYMENT',
            paymentMethod: 'BANK_TRANSFER',
            subsequentAmount: '0',
          },
          {
            discount: {
              amount: '6105',
              percentage: 33,
              type: 'car_discount',
            },
            discountAmount: -6105,
            discountRate: -0.33,
            discountType: 'car_discount',
            feeAmount: '0',
            initialAmount: '0',
            installment: 1,
            issuingBank: null,
            netPremiumAmount: '1908416',
            paymentOption: 'FULL_PAYMENT',
            paymentMethod: 'DIRECT_PAYMENT',
            subsequentAmount: '0',
          },
          {
            discount: {
              amount: '6105',
              percentage: 33,
              type: 'car_discount',
            },
            discountAmount: -6105,
            discountRate: -0.33,
            discountType: 'car_discount',
            feeAmount: '0',
            initialAmount: '0',
            installment: 1,
            issuingBank: null,
            netPremiumAmount: '1908416',
            paymentOption: 'FULL_PAYMENT',
            paymentMethod: 'EDC',
            subsequentAmount: '0',
          },
          {
            discount: {
              amount: '6105',
              percentage: 33,
              type: 'car_discount',
            },
            discountAmount: -6105,
            discountRate: -0.33,
            discountType: 'car_discount',
            feeAmount: '0',
            initialAmount: '0',
            installment: 1,
            issuingBank: null,
            netPremiumAmount: '1908416',
            paymentOption: 'FULL_PAYMENT',
            paymentMethod: 'ONLINECARD',
            subsequentAmount: '0',
          },
          {
            discount: {
              amount: '6105',
              percentage: 33,
              type: 'car_discount',
            },
            discountAmount: -6105,
            discountRate: -0.33,
            discountType: 'car_discount',
            feeAmount: '0',
            initialAmount: '0',
            installment: 1,
            issuingBank: null,
            netPremiumAmount: '1908416',
            paymentOption: 'FULL_PAYMENT',
            paymentMethod: 'QR_CODE',
            subsequentAmount: '0',
          },
        ],
      })
    );
  });
});

describe('formatRabbitCareInstallmentData', () => {
  it('returns formatted RC installment data', () => {
    expect(
      formatRabbitCareInstallmentData(
        'rabbitCareInstallment',
        mockPaymentOptions.paymentOptions
          .rabbitCareInstallment as PaymentOptions['rabbitCareInstallment']
      )
    ).toEqual(
      expect.objectContaining({
        name: 'rabbitCareInstallment',
        options: [
          {
            name: 'QR_CODE',
            options: [
              {
                discount: {
                  amount: '74000',
                  percentage: 400,
                  type: 'DISCOUNT_TYPE_RCL',
                },
                discountAmount: -74000,
                discountRate: -4,
                discountType: 'DISCOUNT_TYPE_RCL',
                feeAmount: '35521',
                initialAmount: '668362',
                installment: 3,
                issuingBank: null,
                netPremiumAmount: '1876042',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                paymentMethod: 'QR_CODE',
                subsequentAmount: '603840',
              },
              {
                discount: {
                  amount: '111000',
                  percentage: 600,
                  type: 'DISCOUNT_TYPE_RCL',
                },
                discountAmount: -111000,
                discountRate: -6,
                discountType: 'DISCOUNT_TYPE_RCL',
                feeAmount: '104341',
                initialAmount: '371744',
                installment: 6,
                issuingBank: null,
                netPremiumAmount: '1907864',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                paymentMethod: 'QR_CODE',
                subsequentAmount: '307224',
              },
              {
                discount: {
                  amount: '74000',
                  percentage: 400,
                  type: 'DISCOUNT_TYPE_RCL',
                },
                discountAmount: -74000,
                discountRate: -4,
                discountType: 'DISCOUNT_TYPE_RCL',
                feeAmount: '150960',
                initialAmount: '305391',
                installment: 8,
                issuingBank: null,
                netPremiumAmount: '1991481',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                paymentMethod: 'QR_CODE',
                subsequentAmount: '240870',
              },
              {
                discount: {
                  amount: '111000',
                  percentage: 600,
                  type: 'DISCOUNT_TYPE_RCL',
                },
                discountAmount: -111000,
                discountRate: -6,
                discountType: 'DISCOUNT_TYPE_RCL',
                feeAmount: '191315',
                initialAmount: '547094',
                installment: 10,
                issuingBank: null,
                netPremiumAmount: '1994834',
                paymentOption: 'RABBIT_CARE_INSTALLMENT',
                paymentMethod: 'QR_CODE',
                subsequentAmount: '160860',
              },
            ],
          },
        ],
      })
    );
  });
});

describe('formatCreditCardInstallmentData', () => {
  it('returns formatted Credit card installment data', () => {
    const formattedCreditCardInfo = formatCreditCardInstallmentData(
      'creditCardInstallment',
      mockPaymentOptions.paymentOptions
        .creditCardInstallment as unknown as PaymentOptions['creditCardInstallment'],
      'en' as LANGUAGES
    );
    expect(formattedCreditCardInfo.name).toStrictEqual('creditCardInstallment');
    expect(formattedCreditCardInfo.cardProviders).toStrictEqual([
      {
        shortName: 'BAY',
        name: 'card-providers/BAY',
        displayName: 'Bank of Ayudhya Public Company Limited',
      },
      {
        shortName: 'BBL',
        name: 'card-providers/BBL',
        displayName: 'Bangkok Bank Public Company Limited',
      },
      {
        shortName: 'FIRST_CHOICE',
        name: 'card-providers/FIRST_CHOICE',
        displayName: 'Krungsri First Choice',
      },
      {
        shortName: 'KBANK',
        name: 'card-providers/KBANK',
        displayName: 'Kasikornbank Public Company Limited',
      },
      {
        shortName: 'KTC',
        name: 'card-providers/KTC',
        displayName: 'Krungthai Card',
      },
      {
        shortName: 'SCB',
        name: 'card-providers/SCB',
        displayName: 'The Siam Commercial Bank Public Company Limited',
      },
      {
        shortName: 'TTB',
        name: 'card-providers/TTB',
        displayName: 'TMBThanachart',
      },
    ]);
  });
});

describe('checkRequireDiscountRequest', () => {
  it('should return false for non discount require discountType', () => {
    const result = checkRequireDiscountRequest({ discountType: 'none' });
    expect(result).toBe(false);
  });

  it('should check approver if it is campaign discount', () => {
    const noApproverResult = checkRequireDiscountRequest({
      discountType: 'campaign_discount',
      approver: '',
    });
    expect(noApproverResult).toBe(false);
    const approverResult = checkRequireDiscountRequest({
      discountType: 'campaign_discount',
      approver: 'supervisor',
    });
    expect(approverResult).toBe(true);
  });

  it('should check max discount if it is agent discount', () => {
    const result = checkRequireDiscountRequest({
      discountType: 'agent_discount',
      maxDiscount: 100,
      requestedDiscount: 1000,
    });
    expect(result).toBe(true);
  });

  it('should return true for match_price discount', () => {
    const result = checkRequireDiscountRequest({
      discountType: 'match_price_discount',
    });
    expect(result).toBe(true);
  });
});

describe('getFormattedError', () => {
  it('returns formatted error from existing api response structure', () => {
    expect(
      getFormattedError({
        data: {
          code: 3,
          message: 'validation error',
          details: [
            {
              '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
              reason: 'REQUEST_VALIDATION_ERROR',
              metadata: {
                detail: 'user does not belong to any team',
                field: 'approver',
                rule: 'invalid.approver',
              },
            },
          ],
        },
      } as any)
    ).toEqual(['user does not belong to any team']);
  });

  it('returns formatted error from new api error structure', () => {
    expect(
      getFormattedError({
        data: {
          code: 3,
          detail: 'validation error',
          message: 'can have 4 custom packages, (Reached max limit)',
        },
      } as any)
    ).toEqual(['can have 4 custom packages, (Reached max limit)']);
  });

  it('returns default error message', () => {
    expect(
      getFormattedError({
        data: {
          code: 3,
          detail: 'validation error',
        },
      } as any)
    ).toEqual(['errorMessage.generalErrorMessage']);
  });
});

describe('updateEligibleVoucherInformation', () => {
  it('merges voucher eligibility into payload when discountRef has values', () => {
    const payload = { foo: 'bar' } as any;
    const voucherEligibility = {
      code: 'ABC123',
      used: false,
      eligibleVoucher: true,
    } as any;

    const result = updateEligibleVoucherInformation(
      payload,
      voucherEligibility,
      false
    );

    expect(result).toEqual(
      expect.objectContaining({
        foo: 'bar',
        voucherEligibility: expect.objectContaining({
          code: 'ABC123',
          used: false,
          eligible: false,
        }),
      })
    );
  });

  it('creates voucherEligibility with only eligible flag when none exists', () => {
    const payload = { amount: 1000 } as any;
    const voucherEligibility = {
      code: 'ABC123',
      used: false,
      eligibleVoucher: true,
    } as any;

    const result = updateEligibleVoucherInformation(
      payload,
      voucherEligibility,
      false
    );

    expect(result.voucherEligibility).toEqual({
      code: 'ABC123',
      used: false,
      eligibleVoucher: true,
      eligible: false,
    });
    expect(result.amount).toBe(1000);
  });

  it('creates voucherEligibility with only eligible flag when discount ref does not exist', () => {
    const payload = { amount: 1000 } as any;
    const voucherEligibility = {} as any;
    const result = updateEligibleVoucherInformation(
      payload,
      voucherEligibility,
      false
    );
    expect(result.voucherEligibility).toEqual({ eligible: false });
  });
});
