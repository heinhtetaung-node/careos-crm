import transformPackageFromGenericToNormal from './transformPackageFromGenericToNormal';
import { createMockInsurancePackageDetailResponse } from 'mock-data/InsurancePackageDetailResponse.mock';

describe('transformPackageFromGenericToNormal', () => {
  it('should return empty object if input is null', () => {
    const input = undefined;
    const result = transformPackageFromGenericToNormal(input);
    expect(result).toEqual({});
  });

  it('should transform basic package data correctly', () => {
    const input = createMockInsurancePackageDetailResponse();
    const result = transformPackageFromGenericToNormal(input);

    expect(result.name).toBe('premiums/test-package-id');
    expect(result.displayName).toBe('Test Package Display Name');
    expect(result.product).toBe('products/car-insurance');
    expect(result.canBuy).toBe(false);
    expect(result.expireTime).toBe('9999-01-01T00:00:00Z');
    expect(result.originalPrice).toBe('1000000');
    expect(result.insuranceCategory).toBe('voluntary');
    expect(result.carInsuranceType).toBe('Type 1');
    expect(result.carRepairType).toBe('Garage');
    expect(result.sumCoverage).toBe('1000000');
    expect(result.sumInsuredSource).toBe('sum_coverage_min');
    expect(result.packageSource).toBe('import');
    expect(result.installmentApplied).toBe(false);
    expect(result.priceSummary).toBe(null);
    expect(result.installmentDetails).toEqual([]);
    expect(result.customQuoteDetails).toBe(null);
    expect(result.provinces).toEqual([]);
    expect(result.insuranceCompany.name).toBe('insurers/1');
    expect(result.insuranceCompany.displayName).toBe('Test Insurance Company');
  });

  it('should normalize car insurance types', () => {
    const testCases = [
      { input: 'TYPE_1', expected: 'Type 1' },
      { input: 'TYPE_2', expected: 'Type 2' },
      { input: 'TYPE_3', expected: 'Type 3' },
      { input: 'UNKNOWN', expected: 'UNKNOWN' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input: type, expected }) => {
      const mockInput = createMockInsurancePackageDetailResponse();
      mockInput.package.carInsuranceType = type;
      const result = transformPackageFromGenericToNormal(mockInput);
      expect(result.carInsuranceType).toBe(expected);
    });
  });

  it('should normalize repair types', () => {
    const testCases = [
      { input: 'GARAGE', expected: 'Garage' },
      { input: 'DEALER', expected: 'Dealer' },
      { input: 'UNKNOWN', expected: 'UNKNOWN' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input: type, expected }) => {
      const mockInput = createMockInsurancePackageDetailResponse();
      mockInput.package.carRepairType = type;
      const result = transformPackageFromGenericToNormal(mockInput);
      expect(result.carRepairType).toBe(expected);
    });
  });

  it('should handle edge cases and null values', () => {
    const mockInput = createMockInsurancePackageDetailResponse();
    (mockInput.package as any).displayName = undefined;
    (mockInput.package as any).insuranceCategory = null;
    (mockInput.package as any).carInsuranceType = undefined;
    (mockInput.package as any).carRepairType = undefined;

    const result = transformPackageFromGenericToNormal(mockInput);
    expect(result.displayName).toBe('');
    expect(result.insuranceCategory).toBe('');
    expect(result.carInsuranceType).toBe(undefined);
    expect(result.carRepairType).toBe(undefined);
  });

  it('should transform strings correctly', () => {
    const mockInput = createMockInsurancePackageDetailResponse();
    mockInput.package.name = 'premiums/test-premiums-id';
    mockInput.package.insuranceCategory = 'VOLUNTARY';

    const result = transformPackageFromGenericToNormal(mockInput);
    expect(result.name).toBe('premiums/test-premiums-id');
    expect(result.insuranceCategory).toBe('voluntary');
  });

  it('should map all required fields', () => {
    const input = createMockInsurancePackageDetailResponse();
    const result = transformPackageFromGenericToNormal(input);

    // Test key field mappings
    expect(result.deductibleAmount).toBe('5000');
    expect(result.sumCoverageMin).toBe('1000000');
    expect(result.sumCoverageMax).toBe('2000000');
    expect(result.bailBondCoverage).toBe('300000');
    expect(result.fireTheftCoverage).toBe('1000000');
    expect(result.floodCoverage).toBe('1000000');
    expect(result.medicalExpensesCoverage).toBe('500000');
    expect(result.personalAccidentCoverage).toBe('1000000');
    expect(result.liabilityPropertyCoverage).toBe('10000000');
    expect(result.liabilityPerPersonCoverage).toBe('1000000');
    expect(result.liabilityPerAccidentCoverage).toBe('2000000');
    expect(result.hasCctvDiscount).toBe(true);
    expect(result.termsEn).toBe('English terms');
    expect(result.termsTh).toBe('Thai terms');
    expect(result.isLowCost).toBe(false);
    expect(result.noClaimBonusAmount).toBe('10000');
    expect(result.claimValue).toBe('50000');
    expect(result.numberOfClaims).toBe(0);
    expect(result.personalAccidentCoverageNo).toBe(1);
    expect(result.customPackageStatus).toBe('APPROVED');
    expect(result.oicCode).toBe('TYPE_110');
  });

  it('should map insurer data correctly', () => {
    const input = createMockInsurancePackageDetailResponse();
    const result = transformPackageFromGenericToNormal(input);

    expect(result.insuranceCompany.name).toBe('insurers/1');
    expect(result.insuranceCompany.displayName).toBe('Test Insurance Company');
    expect(result.insuranceCompany.displayNameTh).toBe('บริษัททดสอบ');
    expect(result.insuranceCompany.shortnameEn).toBe('Test Ins');
    expect(result.insuranceCompany.shortnameTh).toBe('ทดสอบ');
    expect(result.insuranceCompany.rating).toBe(4.5);
    expect(result.insuranceCompany.order).toBe(1);
    expect(result.insuranceCompany.logo).toBe('https://example.com/logo.png');
    expect(result.insuranceCompany.phone).toBe('02-123-4567');
    expect(result.insuranceCompany.website).toBe('https://test-insurance.com');
    expect(result.insuranceCompany.taxId).toBe('1234567890123');
    expect(result.insuranceCompany.ticker).toBe('TEST');
    expect(result.insuranceCompany.fax).toBe('02-123-4568');
    expect(result.insuranceCompany.addressEn).toBe('123 Test Street, Bangkok');
    expect(result.insuranceCompany.addressTh).toBe('123 ถนนทดสอบ กรุงเทพฯ');
    expect(result.insuranceCompany.contactEmail).toBe(
      'contact@test-insurance.com'
    );
    expect(result.insuranceCompany.contactPersonName).toBe('John Doe');
    expect(result.insuranceCompany.infoEn).toBe('Test insurance company info');
    expect(result.insuranceCompany.infoTh).toBe('ข้อมูลบริษัทประกันภัยทดสอบ');
    expect(result.insuranceCompany.carPicturesRequired).toBe(true);
    expect(result.insuranceCompany.brokerCode).toBe('BRK001');
  });

  it('should return object with all expected properties', () => {
    const input = createMockInsurancePackageDetailResponse();
    const result = transformPackageFromGenericToNormal(input);

    const expectedProps = [
      'name',
      'displayName',
      'product',
      'canBuy',
      'createTime',
      'expireTime',
      'originalPrice',
      'insuranceCategory',
      'carInsuranceType',
      'carDiscountAmount',
      'carDiscountPercentage',
      'carRepairType',
      'sumCoverage',
      'sumInsuredSource',
      'sumCoverageMin',
      'sumCoverageMax',
      'deductibleAmount',
      'fireTheftCoverage',
      'floodCoverage',
      'personalAccidentCoverage',
      'medicalExpensesCoverage',
      'liabilityPerAccidentCoverage',
      'liabilityPerPersonCoverage',
      'liabilityPropertyCoverage',
      'invoicePrice',
      'grossMandatoryPremium',
      'grossVoluntaryPremium',
      'sumInsuredDefault',
      'sumInsuredMin',
      'sumInsuredMax',
      'hasCctvDiscount',
      'packageSource',
      'bailBondCoverage',
      'termsEn',
      'termsTh',
      'isLowCost',
      'couponDiscountAmount',
      'insuranceCompany',
      'noClaimBonusAmount',
      'claimValue',
      'numberOfClaims',
      'installmentApplied',
      'priceSummary',
      'installmentDetails',
      'personalAccidentCoverageNo',
      'customQuoteDetails',
      'customPackageStatus',
      'oicCode',
      'provinces',
    ];

    expectedProps.forEach((prop) => expect(result).toHaveProperty(prop));
    expect(result.insuranceCompany).toHaveProperty('name');
    expect(result.insuranceCompany).toHaveProperty('displayName');
    expect(result.insuranceCompany).toHaveProperty('rating');
  });
});
