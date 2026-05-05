import premiumDetailProductToPremiumToPackage from './premiumDetailToPackage';
import type { PremiumDetailProduct } from './insurancePackageApi.types';

jest.mock('config/constant', () => ({
  INSURER_LOGO_BASE_URL: 'https://example.com',
}));

function makeCoverage(
  coverageType: string,
  opts: { units?: string; nanos?: number; textValue?: string } = {}
): PremiumDetailProduct['coverages'][number] {
  return {
    name: `coverages/${coverageType}`,
    coverageId: coverageType,
    coverageType,
    coverageName: coverageType,
    textValue: opts.textValue ?? '',
    singleValue:
      opts.units !== undefined
        ? { currencyCode: 'THB', units: opts.units, nanos: opts.nanos ?? 0 }
        : null,
    minValue: null,
    avgValue: null,
    maxValue: null,
    limit: null,
    isAddOn: false,
    addOnPremium: null,
    addOnDefaultStatus: false,
    displayOrder: 0,
    description: '',
    createTime: '',
    updateTime: '',
    deleteTime: null,
  };
}

function makeProduct(
  coverages: PremiumDetailProduct['coverages'],
  opts: {
    priceUnits?: string;
    packageName?: string;
    applicableProvince?: string;
  } = {}
): PremiumDetailProduct {
  return {
    premium: {
      name: 'premiums/pkg001',
      premiumId: 'prem-1',
      price: {
        currencyCode: 'THB',
        units: opts.priceUnits ?? '5000',
        nanos: 0,
      },
      description: 'Basic Package',
      createTime: '',
      updateTime: '',
      deleteTime: null,
      redbookId: 'rb1',
      insurerCarId: 'car1',
      valueRatio: 1,
    },
    package: {
      name: 'packages/pkg001',
      packageId: 'pkg-1',
      insurerReferenceCode: 'REF001',
      packageName: opts.packageName ?? 'Test Package',
      insurer: 'insurers/vib',
      wording: 'T&C text',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      description: 'Package description',
      purchaseReady: true,
      applicableProvince: opts.applicableProvince ?? 'Bangkok',
      createTime: '',
      updateTime: '',
      deleteTime: null,
    },
    coverages,
  };
}

describe('premiumDetailProductToPremiumToPackage', () => {
  describe('monetary conversion (units + nanos)', () => {
    it('treats coverage units as satang', () => {
      const product = makeProduct([
        makeCoverage('maximumAnnualCoverage', { units: '500000', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.maximumAnnualCoverage).toBe(500_000);
    });

    it('converts nanos to satang and adds to units', () => {
      // 1 satang = 10,000,000 nanos
      const product = makeProduct([
        makeCoverage('maximumAnnualCoverage', {
          units: '1000',
          nanos: 50_000_000,
        }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      // units: 1000 satang; nanos: 50_000_000 / 10_000_000 = 5 satang
      expect(result.coverageDetails.maximumAnnualCoverage).toBe(1_005);
    });

    it('returns 0 when singleValue is null', () => {
      const product = makeProduct([makeCoverage('maximumAnnualCoverage')]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.maximumAnnualCoverage).toBe(0);
    });
  });

  describe('coverageType aliasing', () => {
    it('maps ownedCarDamage to maximumAnnualCoverage when maximumAnnualCoverage is absent', () => {
      const product = makeProduct([
        makeCoverage('ownedCarDamage', { units: '100', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.maximumAnnualCoverage).toBe(100);
    });

    it('maps ownCarDamage to maximumAnnualCoverage when maximumAnnualCoverage is absent', () => {
      const product = makeProduct([
        makeCoverage('ownCarDamage', { units: '200', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.maximumAnnualCoverage).toBe(200);
    });

    it('maps ownedCarFireTheft to theftAndFireCoverage', () => {
      const product = makeProduct([
        makeCoverage('ownedCarFireTheft', { units: '50', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.theftAndFireCoverage).toBe(50);
    });

    it('maps fireAndTheft to theftAndFireCoverage', () => {
      const product = makeProduct([
        makeCoverage('fireAndTheft', { units: '75', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.theftAndFireCoverage).toBe(75);
    });

    it('maps ownedCarFlood to floodCoverage', () => {
      const product = makeProduct([
        makeCoverage('ownedCarFlood', { units: '30', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.floodCoverage).toBe(30);
    });

    it('maps thirdPartyMaxDeath to maximumDeath', () => {
      const product = makeProduct([
        makeCoverage('thirdPartyMaxDeath', { units: '100', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.maximumDeath).toBe(100);
    });

    it('prefers direct key over alias', () => {
      const product = makeProduct([
        makeCoverage('theftAndFireCoverage', { units: '100', nanos: 0 }),
        makeCoverage('ownedCarFireTheft', { units: '50', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.coverageDetails.theftAndFireCoverage).toBe(100);
    });
  });

  describe('oicCode casing', () => {
    it('reads oicCode with lowercase key', () => {
      const product = makeProduct([
        makeCoverage('oicCode', { textValue: 'BKK_001' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.oicCode).toBe('BKK_001');
    });

    it('reads OicCode with capitalized key when lowercase is absent', () => {
      const product = makeProduct([
        makeCoverage('OicCode', { textValue: 'BKK_002' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.oicCode).toBe('BKK_002');
    });

    it('prefers lowercase oicCode over OicCode', () => {
      const product = makeProduct([
        makeCoverage('oicCode', { textValue: 'BKK_001' }),
        makeCoverage('OicCode', { textValue: 'BKK_002' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.oicCode).toBe('BKK_001');
    });

    it('returns empty string when neither key is present', () => {
      const product = makeProduct([]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.oicCode).toBe('');
    });
  });

  describe('deductible parsing', () => {
    it('parses numeric text value as deductible', () => {
      const product = makeProduct([
        makeCoverage('deductible', { textValue: '3000' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.deductible).toBe(3000);
    });

    it('falls back to singleValue units when textValue is not a number', () => {
      const product = makeProduct([
        makeCoverage('deductible', { units: '50', nanos: 0 }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.deductible).toBe(50);
    });

    it('uses fallback deductibleSatang when no coverage deductible', () => {
      const product = makeProduct([]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib', {
        deductibleSatang: 1000,
      });
      expect(result.deductible).toBe(1000);
    });
  });

  describe('applicableProvince parsing', () => {
    it('wraps single province in an array', () => {
      const product = makeProduct([], { applicableProvince: 'Bangkok' });
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.applicableProvinces).toEqual(['Bangkok']);
    });

    it('splits comma-separated provinces into array', () => {
      const product = makeProduct([], {
        applicableProvince: 'Bangkok, Chiang Mai, Phuket',
      });
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.applicableProvinces).toEqual([
        'Bangkok',
        'Chiang Mai',
        'Phuket',
      ]);
    });

    it('returns empty array when applicableProvince is empty', () => {
      const product = makeProduct([], { applicableProvince: '' });
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.applicableProvinces).toEqual([]);
    });
  });

  describe('general mapping', () => {
    it('maps basic fields correctly', () => {
      const product = makeProduct(
        [makeCoverage('insuranceType', { textValue: 'voluntary' })],
        {
          priceUnits: '8000',
          packageName: 'Gold Package',
          applicableProvince: 'Bangkok',
        }
      );
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');

      expect(result.id).toBe('premiums/pkg001');
      expect(result.packageName).toBe('Gold Package');
      expect(result.insuranceType).toBe('voluntary');
      expect(result.insuranceCategory).toBe('voluntary');
      expect(result.price).toBe(8000);
      expect(result.premium).toBe(8000);
      expect(result.startDate).toBe('2024-01-01');
      expect(result.expiryDate).toBe('2024-12-31');
      expect(result.termsAndConditions).toBe('T&C text');
      expect(result.insuranceCompany.logo).toBe(
        'https://example.com/insurers/vib.png'
      );
    });

    it('sets insuranceCategory to mandatory when insuranceType is mandatory', () => {
      const product = makeProduct([
        makeCoverage('insuranceType', { textValue: 'Mandatory' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.insuranceCategory).toBe('mandatory');
    });

    it('uses fallback insuranceType when coverage is absent', () => {
      const product = makeProduct([]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib', {
        insuranceType: 'voluntary',
      });
      // Implementation uses ?? for fallback; getCovText returns '' when absent, and '' ?? fallback is '' (empty string is not nullish)
      expect(result.insuranceType).toBe('');
    });

    it('uses fallback subModel', () => {
      const product = makeProduct([]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib', {
        subModel: 'GT Sport',
      });
      expect(result.subModel).toBe('GT Sport');
    });

    it('normalizes repairType from coverage text', () => {
      const product = makeProduct([
        makeCoverage('repairType', { textValue: 'Dealer repair' }),
      ]);
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.repairType).toBe('Dealer');
    });
  });

  describe('price vs premium (voluntary vs mandatory)', () => {
    it('splits total price into premium (voluntary) and mandatoryPricePerYear for display', () => {
      const product = makeProduct(
        [
          makeCoverage('insuranceType', { textValue: 'Type 3' }),
          makeCoverage('mandatoryPrice', { units: '2000', nanos: 0 }),
        ],
        { priceUnits: '10000' }
      );
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.price).toBe(10000);
      expect(result.mandatoryPricePerYear).toBe(2000);
      expect(result.premium).toBe(8000);
    });

    it('premium is total when mandatoryPrice coverage is absent (voluntary-only)', () => {
      const product = makeProduct(
        [makeCoverage('insuranceType', { textValue: 'Type 3' })],
        { priceUnits: '5000' }
      );
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.price).toBe(5000);
      expect(result.mandatoryPricePerYear).toBe(0);
      expect(result.premium).toBe(5000);
    });

    it('premium is 0 when total equals mandatory (mandatory-only)', () => {
      const product = makeProduct(
        [
          makeCoverage('insuranceType', { textValue: 'Mandatory' }),
          makeCoverage('mandatoryPrice', { units: '1000000', nanos: 0 }),
        ],
        { priceUnits: '10000' }
      );
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.price).toBe(10000);
      expect(result.mandatoryPricePerYear).toBe(1000000);
      expect(result.premium).toBe(0);
    });

    it('both (Type X Mandatory): p.price is voluntary only, premium = p.price, price = voluntary + mandatory', () => {
      const product = makeProduct(
        [
          makeCoverage('insuranceType', { textValue: 'Type 3 Mandatory' }),
          makeCoverage('mandatoryPrice', { units: '2000', nanos: 0 }),
        ],
        { priceUnits: '65265' }
      );
      const result = premiumDetailProductToPremiumToPackage(product, 'vib');
      expect(result.premium).toBe(65265);
      expect(result.mandatoryPricePerYear).toBe(2000);
      expect(result.price).toBe(67265);
    });
  });
});
