import { INSURANCE_KIND } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { InsuranceKind } from 'shared/types/insurers';
import {
  mockPremium,
  minimalPremium,
  premiumWithAllProvinces,
  mandatoryPremium,
} from '../../../../mock-data/packageListingTestData';

import {
  getHeaderTitleByPackageSource,
  getInsuranceTypeSubtitleDisplayText,
  getPackageTypeLabel,
  getPackageTypeLabelFromOrderData,
  PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY,
  generateLendingApiPayload,
  generateDiscountPricingApiPayload,
  getInsuranceKind,
  transformPremiumToPackage,
  PremiumToPackage,
  getOriginalPackageSource,
  createPackageSourceMap,
  mergeTransformedPackagesForComparePage,
  mergePackagesForCompareBar,
} from './packageListing.helper';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

describe('Test getHeaderTitleByPackageSource', () => {
  test('Should return packageListing.manualQuote if input manual', () => {
    const resultData = getHeaderTitleByPackageSource('manual');
    expect(resultData).toEqual('packageListing.manualQuote');
  });

  test('Should not return packageListing.manualQuote if input renewal', () => {
    const resultData = getHeaderTitleByPackageSource('renewal_manual_quote');
    expect(resultData).not.toEqual('packageListing.manualQuote');
  });

  test('Should return packageListing.renewalPackage if input renewal', () => {
    const resultData = getHeaderTitleByPackageSource('renewal_manual_quote');
    expect(resultData).toEqual('packageListing.renewalPackage');
  });

  test('Should not return packageListing.renewalPackage if input renewal', () => {
    const resultData = getHeaderTitleByPackageSource('renewal_manual_quote');
    expect(resultData).not.toEqual('packageListing.manualQuote');
  });

  test('Should return packageListing.renewalPackage if input passed renewal', () => {
    const resultData = getHeaderTitleByPackageSource('renewal_manual_quote');
    expect(resultData).toEqual('packageListing.renewalPackage');
  });

  test('Should return packageListing.customQuote if input passed custom', () => {
    const resultData = getHeaderTitleByPackageSource('custom');
    expect(resultData).toEqual('packageListing.customQuote');
  });

  test('Should return emplty string if input passed import package type', () => {
    const resultData = getHeaderTitleByPackageSource('import');
    expect(resultData).toEqual('');
  });
});

describe('getInsuranceTypeSubtitleDisplayText', () => {
  test('appends compulsory label for both when subtitle is not mandatory-only key', () => {
    expect(
      getInsuranceTypeSubtitleDisplayText({
        subtitle: 'packageListing.values.insuranceType.type1',
        insuranceKind: 'both',
      })
    ).toBe(
      `packageListing.values.insuranceType.type1\u00A0${PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY}`
    );
  });

  test('does not append when subtitle is already mandatory-only', () => {
    expect(
      getInsuranceTypeSubtitleDisplayText({
        subtitle: PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY,
        insuranceKind: 'both',
      })
    ).toBe(PACKAGE_LISTING_SUBTITLE_MANDATORY_ONLY_KEY);
  });

  test('does not append when insurance kind is not both', () => {
    expect(
      getInsuranceTypeSubtitleDisplayText({
        subtitle: 'packageListing.values.insuranceType.type1',
        insuranceKind: 'voluntary',
      })
    ).toBe('packageListing.values.insuranceType.type1');
  });
});

describe('getPackageTypeLabel', () => {
  test('returns standard label when packageSource is custom', () => {
    expect(getPackageTypeLabel('custom')).toBe(
      'packageListing.packageType.standard'
    );
  });

  test('returns manual label when packageSource is manual', () => {
    expect(getPackageTypeLabel('manual')).toBe(
      'packageListing.packageType.manual'
    );
  });

  test('returns renewal label when packageSource is renewal_manual_quote', () => {
    expect(getPackageTypeLabel('renewal_manual_quote')).toBe(
      'packageListing.packageType.renewal'
    );
  });

  test('returns standard label for default/other packageSource', () => {
    expect(getPackageTypeLabel()).toBe('packageListing.packageType.standard');
    expect(getPackageTypeLabel('import')).toBe(
      'packageListing.packageType.standard'
    );
  });
});

describe('getOriginalPackageSource', () => {
  const mockPackages = [
    { name: 'packages/123', packageSource: 'standard' },
    { name: 'packages/456', packageSource: 'manual' },
    { name: 'packages/789', packageSource: 'renewal_manual_quote' },
    { name: 'customPackages/abc', packageSource: 'custom' },
  ];

  const createMap = (packages: any[]) => createPackageSourceMap(packages);

  test('returns undefined when originalPackageName is undefined', () => {
    expect(
      getOriginalPackageSource(undefined, createMap(mockPackages))
    ).toBeUndefined();
  });

  test('returns undefined when originalPackageName is empty string', () => {
    expect(
      getOriginalPackageSource('', createMap(mockPackages))
    ).toBeUndefined();
  });

  test('returns packageSource when original package is found', () => {
    const map = createMap(mockPackages);

    expect(getOriginalPackageSource('packages/123', map)).toBe('standard');
    expect(getOriginalPackageSource('packages/456', map)).toBe('manual');
    expect(getOriginalPackageSource('packages/789', map)).toBe(
      'renewal_manual_quote'
    );
  });

  test('returns undefined when original package is not found', () => {
    expect(
      getOriginalPackageSource('packages/nonexistent', createMap(mockPackages))
    ).toBeUndefined();
  });

  test('returns undefined when packages map is empty', () => {
    expect(getOriginalPackageSource('packages/123', new Map())).toBeUndefined();
  });

  test('handles package without packageSource property', () => {
    const packagesWithoutSource = [
      { name: 'packages/123' },
      { name: 'packages/456', packageSource: 'manual' },
    ];

    const map = createMap(packagesWithoutSource);

    expect(getOriginalPackageSource('packages/123', map)).toBeUndefined();
    expect(getOriginalPackageSource('packages/456', map)).toBe('manual');
  });
});

describe('getPackageTypeLabelFromOrderData', () => {
  test('RENEWAL returns renewal label', () => {
    expect(getPackageTypeLabelFromOrderData('RENEWAL')).toBe(
      'packageListing.packageType.renewal'
    );
  });

  test('CUSTOM returns standard label', () => {
    expect(getPackageTypeLabelFromOrderData('CUSTOM')).toBe(
      'packageListing.packageType.standard'
    );
  });

  test('STANDARD with source containing "manual" returns manual label', () => {
    expect(getPackageTypeLabelFromOrderData('STANDARD', 'MANUAL')).toBe(
      'packageListing.packageType.manual'
    );
    expect(
      getPackageTypeLabelFromOrderData('STANDARD', 'renewal_manual_quote')
    ).toBe('packageListing.packageType.manual');
  });

  test('STANDARD with source not containing "manual" returns standard label', () => {
    expect(getPackageTypeLabelFromOrderData('STANDARD', 'import')).toBe(
      'packageListing.packageType.standard'
    );
    expect(getPackageTypeLabelFromOrderData('STANDARD')).toBe(
      'packageListing.packageType.standard'
    );
  });

  test('default/unknown packageType returns standard label', () => {
    expect(getPackageTypeLabelFromOrderData()).toBe(
      'packageListing.packageType.standard'
    );
    expect(getPackageTypeLabelFromOrderData('UNKNOWN')).toBe(
      'packageListing.packageType.standard'
    );
  });
});

describe('Test generateLendingApiPayload', () => {
  test('should return payload when packages are passed', () => {
    const payloadData = {
      installment: 10,
      insuranceKind: 'BOTH' as InsuranceKind,
      packages: ['packages/1354810'],
      paymentOption: 'CREDIT_CARD_INSTALLMENT',
      sumInsuredMax: '70000000',
      sumInsuredMin: '10000000',
    };

    const resultData = generateLendingApiPayload(payloadData);
    expect(resultData).toEqual(
      expect.objectContaining({
        installmentPlan: 10,
        insuranceKind: 'BOTH',
        packages: ['packages/1354810'],
        paymentMethod: 'ONLINECARD',
        paymentOption: 'CREDIT_CARD_INSTALLMENT',
        sumInsuredMax: '70000000',
        sumInsuredMin: '10000000',
      })
    );
  });

  test('should return payload when package is passed', () => {
    const payloadData = {
      installment: 1,
      insuranceKind: 'BOTH' as InsuranceKind,
      package: 'packages/1354810',
      paymentOption: 'FULL_PAYMENT',
      sumInsuredMax: '70000000',
      sumInsuredMin: '10000000',
    };

    const resultData = generateLendingApiPayload(payloadData);
    expect(resultData).toEqual(
      expect.objectContaining({
        installmentPlan: 1,
        insuranceKind: 'BOTH',
        package: 'packages/1354810',
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        sumInsuredMax: '70000000',
        sumInsuredMin: '10000000',
      })
    );
  });
});

describe('generateDiscountPricingApiPayload', () => {
  it('should return correct api payload when only a package data is passed', () => {
    const result = generateDiscountPricingApiPayload([
      {
        installment: 1,
        insuranceKind: 'BOTH' as INSURANCE_KIND,
        package: 'packages/1354810',
        paymentMethod: 'QR_CODE',
        paymentOption: 'FULL_PAYMENT',
        sumInsuredMin: '20000000',
        sumInsuredMax: '100000000',
      },
    ]);
    expect(result).toEqual({
      filters: [
        {
          installmentPlan: 1,
          insuranceKind: 'BOTH',
          package: 'packages/1354810',
          paymentMethod: 'QR_CODE',
          paymentOption: 'FULL_PAYMENT',
          sumInsuredMax: '100000000',
          sumInsuredMin: '20000000',
        },
      ],
    });
  });

  it('should return nonapplicable installment if package is not applicable whth installment supported paymentOption', () => {
    const result = generateDiscountPricingApiPayload([
      {
        package: 'customPackages/6519c2ff-f093-4535-a94b-8e6aabcbca56',
        insuranceKind: 'BOTH' as INSURANCE_KIND,
        paymentOption: 'CREDIT_CARD_INSTALLMENT',
        paymentMethod: 'ONLINECARD',
        installment: 6,
      },
      {
        package: 'customPackages/b3776965-21c5-464c-87ad-694de033b0a6',
        insuranceKind: 'BOTH' as INSURANCE_KIND,
        paymentOption: 'RABBIT_CARE_INSTALLMENT',
        paymentMethod: 'QR_CODE',
        installment: 6,
      },
    ]);
    expect(result).toEqual({
      filters: [
        {
          installmentPlan: 6,
          insuranceKind: 'BOTH',
          package: 'customPackages/6519c2ff-f093-4535-a94b-8e6aabcbca56',
          paymentMethod: 'ONLINECARD',
          paymentOption: 'CREDIT_CARD_INSTALLMENT',
        },
        {
          installmentPlan: 6,
          insuranceKind: 'BOTH',
          package: 'customPackages/b3776965-21c5-464c-87ad-694de033b0a6',
          paymentMethod: 'QR_CODE',
          paymentOption: 'RABBIT_CARE_INSTALLMENT',
        },
      ],
    });
  });
});

describe('Test getInsuranceKind', () => {
  test('should return voluntary for type 1, 2, 3, 2+, 3+', () => {
    expect(getInsuranceKind('type 1')).toBe('voluntary');
    expect(getInsuranceKind('type 2')).toBe('voluntary');
    expect(getInsuranceKind('type 3')).toBe('voluntary');
    expect(getInsuranceKind('type 2+')).toBe('voluntary');
    expect(getInsuranceKind('type 3+')).toBe('voluntary');
  });

  test('should return mandatory for mandatory', () => {
    expect(getInsuranceKind('mandatory')).toBe('mandatory');
  });

  test('should return both for mandatory types', () => {
    expect(getInsuranceKind('type 1 mandatory')).toBe('both');
    expect(getInsuranceKind('type 2 mandatory')).toBe('both');
    expect(getInsuranceKind('type 3 mandatory')).toBe('both');
    expect(getInsuranceKind('type 2+ mandatory')).toBe('both');
    expect(getInsuranceKind('type 3+ mandatory')).toBe('both');
  });

  test('should return both for unknown type and handle case insensitive input', () => {
    expect(getInsuranceKind('unknown')).toBe('both');
    expect(getInsuranceKind('TYPE 1')).toBe('voluntary');
    expect(getInsuranceKind('MANDATORY')).toBe('mandatory');
    expect(getInsuranceKind('TYPE 1 MANDATORY')).toBe('both');
  });

  test('should handle edge cases and null/undefined inputs', () => {
    expect(getInsuranceKind('')).toBe('both');
    expect(getInsuranceKind(null as any)).toBe('both');
    expect(getInsuranceKind(undefined as any)).toBe('both');
  });
});

describe('Test transformPremiumToPackage', () => {
  test('should transform premium to package correctly', () => {
    const result = transformPremiumToPackage(mockPremium);

    expect(result.name).toBe('test-id');
    expect(result.id).toBe('test-id');
    expect(result.displayName).toBe(
      'Test Package_OIC OIC123_type 1_Test Repair_Test SubModel'
    );
    expect(result.product).toBe('products/car-insurance');
    expect(result.canBuy).toBe(true);
    expect(result.insuranceKind).toBe('voluntary');
    expect(result.subtitle).toBe('type 1');
    expect(result.sumCoverage).toBe('10,000');
    expect(result.premium).toBe('120');
    expect(result.grossMandatoryPremium).toBe('20');
    expect(result.provinces).toEqual([
      'provinces/Bangkok',
      'provinces/Chiang Mai',
    ]);
  });

  test('should handle missing optional fields', () => {
    const result = transformPremiumToPackage(minimalPremium);

    expect(result.insuranceCategory).toBe('Unknown');
    expect(result.insuranceKind).toBe('mandatory');
    expect(result.subtitle).toBe('mandatory');
    expect(result.sumCoverage).toBe('0');
    expect(result.provinces).toEqual([]);
  });

  test('should handle all provinces case and mandatory insurance type', () => {
    const result1 = transformPremiumToPackage(premiumWithAllProvinces);
    expect(result1.provinces).toEqual(['provinces/all']);

    const result2 = transformPremiumToPackage(mandatoryPremium);
    expect(result2.insuranceKind).toBe('both');
    expect(result2.subtitle).toBe('type 1 mandatory');
  });

  test('should handle different insurance types correctly', () => {
    const type2Premium = {
      ...mockPremium,
      insuranceType: 'type 2',
    };
    const result1 = transformPremiumToPackage(type2Premium as PremiumToPackage);
    expect(result1.insuranceKind).toBe('voluntary');
    expect(result1.subtitle).toBe('type 2');

    const type3PlusPremium = {
      ...mockPremium,
      insuranceType: 'type 3+',
    };
    const result2 = transformPremiumToPackage(
      type3PlusPremium as PremiumToPackage
    );
    expect(result2.insuranceKind).toBe('voluntary');
    expect(result2.subtitle).toBe('type 3+');
  });

  test('should format currency values correctly', () => {
    const result = transformPremiumToPackage(mockPremium);

    expect(result.sumCoverage).toBe('10,000');
    expect(result.premium).toBe('120');
    expect(result.originalPrice).toBe('150');
    expect(result.invoicePrice).toBe('150');
    // regression: premium must exclude the mandatory fee
    expect(result.grossMandatoryPremium).toBe('20');
    expect(Number(result.premium.replace(',', ''))).toBeLessThan(
      Number(result.originalPrice.replace(',', ''))
    );
  });

  test('should handle coverage details correctly', () => {
    const result = transformPremiumToPackage(mockPremium);

    expect(result.fireTheftCoverage).toBe('5000');
    expect(result.floodCoverage).toBe('3000');
    expect(result.personalAccidentCoverage).toBe('1000');
    expect(result.medicalExpensesCoverage).toBe('500');
    expect(result.liabilityPerAccidentCoverage).toBe('20000');
    expect(result.liabilityPerPersonCoverage).toBe('10000');
    expect(result.liabilityPropertyCoverage).toBe('5000');
    expect(result.bailBondCoverage).toBe('100');
  });

  test('should set correct default values for missing data', () => {
    const result = transformPremiumToPackage(minimalPremium);

    expect(result.carDiscountAmount).toBe('0');
    expect(result.carDiscountPercentage).toBe(0);
    expect(result.hasCctvDiscount).toBe(false);
    expect(result.isLowCost).toBe(false);
    expect(result.couponDiscountAmount).toBe('0');
    expect(result.noClaimBonusAmount).toBe('0');
    expect(result.claimValue).toBe('0');
    expect(result.numberOfClaims).toBe(0);
    expect(result.installmentApplied).toBe(false);
    expect(result.priceSummary).toBe(null);
    expect(result.installmentDetails).toEqual([]);
  });

  test('should handle insurance company data correctly', () => {
    const result = transformPremiumToPackage(mockPremium);

    expect(result.insuranceCompany.name).toBe('Test Insurance');
    expect(result.insuranceCompany.displayName).toBe('Test Insurance Co.');
    expect(result.insuranceCompany.logo).toBe('test-logo.png');
    expect(result.logo).toBe('test-logo.png');
    expect(result.title).toBe('Test Insurance Co.');
  });

  test('should handle OIC code and display name formatting', () => {
    const result = transformPremiumToPackage(mockPremium);

    expect(result.oicCode).toBe('OIC123');
    expect(result.displayName).toBe(
      'Test Package_OIC OIC123_type 1_Test Repair_Test SubModel'
    );
  });

  test('should handle gross premiums and sum insured values correctly', () => {
    const result = transformPremiumToPackage(mockPremium);
    expect(result.grossMandatoryPremium).toBe('20');
    expect(result.grossVoluntaryPremium).toBe('120');
    expect(result.sumInsuredDefault).toBe('10000');
    expect(result.sumInsuredMin).toBe('10000');
    expect(result.sumInsuredMax).toBe('10000');
  });

  test('should handle zero values for gross premiums and sum insured', () => {
    const zeroPremium = {
      ...mockPremium,
      mandatoryPricePerYear: 0,
      premium: 0,
      carCoverage: 0,
    };
    const result = transformPremiumToPackage(zeroPremium as PremiumToPackage);
    expect(result.grossMandatoryPremium).toBe('0');
    expect(result.grossVoluntaryPremium).toBe('0');
    expect(result.sumInsuredDefault).toBe('0');
    expect(result.sumInsuredMin).toBe('0');
    expect(result.sumInsuredMax).toBe('0');
  });

  test('should handle null values for gross premiums and sum insured', () => {
    const nullPremium = {
      ...mockPremium,
      mandatoryPricePerYear: null,
      premium: null,
      carCoverage: null,
    };
    const result = transformPremiumToPackage(nullPremium as any);
    expect(result.grossMandatoryPremium).toBe('0');
    expect(result.grossVoluntaryPremium).toBe('0');
    expect(result.sumInsuredDefault).toBe('0');
    expect(result.sumInsuredMin).toBe('0');
    expect(result.sumInsuredMax).toBe('0');
  });

  test('should handle sum coverage and deductible values correctly', () => {
    const result = transformPremiumToPackage(mockPremium);
    expect(result.sumCoverage).toBe('10,000');
    expect(result.sumInsuredSource).toBeUndefined();
    expect(result.sumCoverageMin).toBe('10000');
    expect(result.sumCoverageMax).toBe('10000');
    expect(result.deductibleAmount).toBe('50');
    expect(result.fireTheftCoverage).toBe('5000');
  });

  test('should handle zero values for sum coverage and deductible', () => {
    const zeroPremium = {
      ...mockPremium,
      carCoverage: 0,
      deductible: 0,
      coverageDetails: {
        ...mockPremium.coverageDetails,
        theftAndFireCoverage: 0,
      },
    };
    const result = transformPremiumToPackage(zeroPremium as PremiumToPackage);
    expect(result.sumCoverage).toBe('0');
    expect(result.sumCoverageMin).toBe('0');
    expect(result.sumCoverageMax).toBe('0');
    expect(result.deductibleAmount).toBe('0');
    expect(result.fireTheftCoverage).toBe('0');
  });

  test('should handle null values for sum coverage and deductible', () => {
    const nullPremium = {
      ...mockPremium,
      carCoverage: null,
      deductible: null,
      coverageDetails: {
        ...mockPremium.coverageDetails,
        theftAndFireCoverage: null,
      },
    };
    const result = transformPremiumToPackage(nullPremium as any);
    expect(result.sumCoverage).toBe('0');
    expect(result.sumCoverageMin).toBe('0');
    expect(result.sumCoverageMax).toBe('0');
    expect(result.deductibleAmount).toBe('0');
    expect(result.fireTheftCoverage).toBe('0');
  });
  test('should handle provinces when applicableProvinces includes All provinces', () => {
    const allProvincesPremium = {
      ...mockPremium,
      applicableProvinces: ['All provinces'],
    };
    const result = transformPremiumToPackage(
      allProvincesPremium as PremiumToPackage
    );
    expect(result.provinces).toEqual(['provinces/all']);
  });
  test('should handle provinces when applicableProvinces is a string', () => {
    const stringProvincesPremium = {
      ...mockPremium,
      applicableProvinces: 'Bangkok' as any,
    };
    const result = transformPremiumToPackage(stringProvincesPremium as any);
    expect(result.provinces).toBe('Bangkok');
  });
  test('should handle provinces when applicableProvinces is an array of provinces', () => {
    const arrayProvincesPremium = {
      ...mockPremium,
      applicableProvinces: ['Bangkok', 'Chiang Mai', 'Phuket'],
    };
    const result = transformPremiumToPackage(
      arrayProvincesPremium as PremiumToPackage
    );
    expect(result.provinces).toEqual([
      'provinces/Bangkok',
      'provinces/Chiang Mai',
      'provinces/Phuket',
    ]);
  });
  test('should handle provinces when applicableProvinces is null or undefined', () => {
    const nullProvincesPremium = {
      ...mockPremium,
      applicableProvinces: null,
    };
    const result1 = transformPremiumToPackage(nullProvincesPremium as any);
    expect(result1.provinces).toEqual([]);
    const undefinedProvincesPremium = {
      ...mockPremium,
      applicableProvinces: undefined,
    };
    const result2 = transformPremiumToPackage(undefinedProvincesPremium as any);
    expect(result2.provinces).toEqual([]);
  });
  test('should handle provinces when applicableProvinces is empty array', () => {
    const emptyProvincesPremium = {
      ...mockPremium,
      applicableProvinces: [],
    };
    const result = transformPremiumToPackage(
      emptyProvincesPremium as PremiumToPackage
    );
    expect(result.provinces).toEqual([]);
  });
});

describe('mergeTransformedPackagesForComparePage', () => {
  const listing = [{ name: 'premiums/a' }, { name: 'customPackages/x' }] as any[];
  const premiumDetail = [{ name: 'premiums/a', displayName: 'from detail' }] as any[];

  it('returns one column per id; prefers premium detail over listing for premiums/', () => {
    const merged = mergeTransformedPackagesForComparePage(
      ['premiums/a', 'customPackages/x'],
      listing,
      premiumDetail
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]).toEqual(premiumDetail[0]);
    expect(merged[1]).toEqual(listing[1]);
  });

  it('dedupes ids and does not duplicate when listing and premium both have the same premium', () => {
    const merged = mergeTransformedPackagesForComparePage(
      ['premiums/a', 'premiums/a'],
      listing,
      premiumDetail
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(premiumDetail[0]);
  });
});

describe('mergePackagesForCompareBar', () => {
  const rawPkg = { name: 'premiums/a', displayName: 'from raw' } as any;
  const detailPkg = { name: 'premiums/a', displayName: 'from detail' } as any;
  const customPkg = { name: 'customPackages/x', displayName: 'custom' } as any;

  it('preserves id order in the returned array', () => {
    const rawPackages = [customPkg, rawPkg];
    const merged = mergePackagesForCompareBar(
      ['customPackages/x', 'premiums/a'],
      [detailPkg],
      rawPackages
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]).toEqual(customPkg);
    expect(merged[1]).toEqual(detailPkg);
  });

  it('prefers comparedPackages detail over rawPackages for premiums/ ids', () => {
    const rawPackages = [rawPkg, customPkg];
    const merged = mergePackagesForCompareBar(
      ['premiums/a'],
      [detailPkg],
      rawPackages
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(detailPkg);
  });

  it('falls back to rawPackages for a premiums/ id when comparedPackages has no match', () => {
    const merged = mergePackagesForCompareBar(
      ['premiums/a'],
      [],
      [rawPkg]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(rawPkg);
  });

  it('falls back to rawPackages for a premiums/ id when comparedPackages is undefined', () => {
    const merged = mergePackagesForCompareBar(
      ['premiums/a'],
      undefined,
      [rawPkg]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(rawPkg);
  });

  it('filters out ids not found in either source', () => {
    const merged = mergePackagesForCompareBar(
      ['premiums/missing', 'customPackages/missing'],
      [],
      []
    );
    expect(merged).toHaveLength(0);
  });

  it('resolves non-premium ids from rawPackages only', () => {
    const merged = mergePackagesForCompareBar(
      ['customPackages/x'],
      [detailPkg],
      [customPkg]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(customPkg);
  });

  it('does not double-count when the same premium id exists in both comparedPackages and rawPackages', () => {
    const rawPackages = [rawPkg, customPkg];
    const merged = mergePackagesForCompareBar(
      ['premiums/a', 'customPackages/x'],
      [detailPkg],
      rawPackages
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]).toEqual(detailPkg);
    expect(merged[1]).toEqual(customPkg);
  });
});
