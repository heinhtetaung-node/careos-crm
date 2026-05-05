import { generateParams, getMaximumPackageLimit } from './helper';
import FeatureFlags from 'config/flagsmithConfig';

var mockEnableComparePackage: any = {};

jest.mock('flagsmith', () => ({
  ...jest.requireActual('flagsmith'),
  getAllFlags: jest.fn(() => mockEnableComparePackage),
}));

beforeEach(() => {
  mockEnableComparePackage = {
    [FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP]: {
      enabled: false,
    },
  };
});

describe('Test getMaximumPackageLimit()', () => {
  test('should return 2 when flag is disabled', () => {
    const resultData = getMaximumPackageLimit();
    expect(resultData).toEqual(2);
  });

  test('should return 3 when flag is enabled', () => {
    mockEnableComparePackage[
      FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP
    ] = { enabled: true };
    const resultData = getMaximumPackageLimit();
    expect(resultData).toEqual(3);
  });
});

describe('generateParams', () => {
  test('should return correct paymentMethod for paymentOption', () => {
    const result = generateParams({
      productType: 'products/car-insurance',
      sumInsuredMax: '100000',
      sumInsuredMin: '10000',
      paymentOption: 'FULL_PAYMENT',
      installment: 3,
      insuranceKind: 'both',
    });
    expect(result).toEqual({
      includeCustomQuote: true,
      'packageFilter.installmentPlan': 3,
      'packageFilter.insuranceKind': 'BOTH',
      'packageFilter.paymentMethod': 'QR_CODE',
      'packageFilter.paymentOption': 'FULL_PAYMENT',
      'packageFilter.sumInsuredMax': '100000',
      'packageFilter.sumInsuredMin': '10000',
      product: 'products/car-insurance',
    });
  });

  test('should not include installment info if paymentOption is empty 1', () => {
    const result = generateParams({
      productType: 'products/car-insurance',
      sumInsuredMax: '1000',
      sumInsuredMin: '100',
      paymentOption: '',
    });
    expect(result).toEqual({
      includeCustomQuote: true,
      'packageFilter.installmentPlan': undefined,
      'packageFilter.insuranceKind': undefined,
      'packageFilter.paymentMethod': undefined,
      'packageFilter.paymentOption': undefined,
      'packageFilter.sumInsuredMax': '1000',
      'packageFilter.sumInsuredMin': '100',
      product: 'products/car-insurance',
    });
  });

  test('should not include installment info if paymentOption is empty 2', () => {
    const result = generateParams({
      productType: 'products/car-insurance',
      sumInsuredMax: '1000',
      sumInsuredMin: '100',
      paymentOption: undefined,
    });
    expect(result).toEqual({
      includeCustomQuote: true,
      'packageFilter.installmentPlan': undefined,
      'packageFilter.insuranceKind': undefined,
      'packageFilter.paymentMethod': undefined,
      'packageFilter.paymentOption': undefined,
      'packageFilter.sumInsuredMax': '1000',
      'packageFilter.sumInsuredMin': '100',
      product: 'products/car-insurance',
    });
  });
});
