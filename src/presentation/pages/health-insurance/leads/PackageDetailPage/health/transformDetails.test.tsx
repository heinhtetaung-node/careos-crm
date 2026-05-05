import transformDetails from './transformDetails';

// Mock dependencies
const mockGetString = jest.fn((key: string) => key);
const mockNumberToMoney = jest.fn((amount: number) => amount.toLocaleString());
const mockSatangToBaht = jest.fn((amount: number) => amount / 100);

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => mockGetString(key),
}));

jest.mock('@careos/utils', () => ({
  numberToMoney: jest.fn((amount: number) => amount.toLocaleString()),
  coverageDetails: {
    ipdOpd: [
      {
        title: 'inpatient_hos_surgery',
        coverages: ['ipdopd_sum_insured_per_year', 'ipdopd_sum_insured_per_time'],
      },
    ],
    disease: [
      {
        title: 'coverage',
        coverages: ['ci_max_coverage', 'ci_sum_insured'],
      },
    ],
    pa: [
      {
        title: 'loss_of_lif_bor1',
        coverages: ['pa_general_accident_ob1'],
      },
    ],
    home: [
      {
        title: 'coverage',
        coverages: ['ci_max_coverage'],
      },
    ],
  },
}));

jest.mock('utils/currency', () => ({
  satangToBaht: jest.fn((amount: number) => amount / 100),
}));

describe('transformDetails.tsx - getCoverageDetails function (lines 5-12)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetString.mockImplementation((key: string) => key);
  });

  describe('Line 5: Function declaration and Line 6: Destructuring', () => {
    it('should destructure category, coverages, product, and plan from apiPackage (line 6)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Verify that the function accessed category, coverages, product, plan
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle apiPackage with missing optional properties (line 6)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {},
        // product and plan are optional
      };

      const result = transformDetails(apiPackage, 'en');

      expect(result).toBeDefined();
      // Should still create package detail section
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Lines 7-8: Getting categoryDetails from coverageDetails', () => {
    it('should get categoryDetails for valid category "ipdOpd" (lines 7-8)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should process ipdOpd category details
      const coverageSections = result.filter(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      expect(coverageSections.length).toBeGreaterThan(0);
    });

    it('should get categoryDetails for valid category "disease" (lines 7-8)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'disease',
        coverages: {
          ci_max_coverage: {
            limitValue: { units: '500000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should process disease category details
      const coverageSections = result.filter(
        (section: any) => section.title === 'healthPackageDetail.titles.coverage'
      );
      expect(coverageSections.length).toBeGreaterThan(0);
    });

    it('should get categoryDetails for valid category "pa" (lines 7-8)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'pa',
        coverages: {
          pa_general_accident_ob1: {
            limitValue: { units: '2000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should process pa category details
      const coverageSections = result.filter(
        (section: any) => section.title === 'healthPackageDetail.titles.loss_of_lif_bor1'
      );
      expect(coverageSections.length).toBeGreaterThan(0);
    });

    it('should get categoryDetails for valid category "home" (lines 7-8)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'home',
        coverages: {
          ci_max_coverage: {
            limitValue: { units: '3000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should process home category details
      const coverageSections = result.filter(
        (section: any) => section.title === 'healthPackageDetail.titles.coverage'
      );
      expect(coverageSections.length).toBeGreaterThan(0);
    });
  });

  describe('Line 9: Null check return', () => {
    it('should return early when categoryDetails is undefined (line 9)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'unknownCategory',
        coverages: {},
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should still return package detail section but no coverage sections
      expect(result).toBeDefined();
      expect(result.length).toBe(1); // Only the package detail section, no coverage sections
      expect(result[0].title).toBe('healthPackageDetail.packageDetail');
    });

    it('should return early when category is null (line 9)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: null,
        coverages: {},
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      expect(result).toBeDefined();
      expect(result.length).toBe(1); // Only package detail section
    });

    it('should return early when category is undefined (line 9)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        // category is undefined
        coverages: {},
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      expect(result).toBeDefined();
      expect(result.length).toBe(1); // Only package detail section
    });
  });

  describe('Line 11: forEach loop and Line 12: Section creation', () => {
    it('should iterate through categoryDetails and create sections (lines 11-12)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Should have package detail + coverage sections
      expect(result.length).toBeGreaterThan(1);
      
      // Verify section structure (line 12)
      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      expect(coverageSection).toBeDefined();
      expect(coverageSection).toMatchObject({
        key: 'key',
        packages: ['packages/test-package'],
        hasData: true,
        items: expect.any(Array),
      });
    });

    it('should create section with correct properties (line 12)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'disease',
        coverages: {
          ci_max_coverage: {
            limitValue: { units: '500000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.coverage'
      );
      
      // Verify section structure from line 12
      expect(coverageSection).toMatchObject({
        key: 'key',
        title: 'healthPackageDetail.titles.coverage',
        packages: ['packages/test-package'],
        hasData: true,
        items: expect.any(Array),
      });
    });

    it('should set hasData based on category, product, or plan (line 16)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      expect(coverageSection?.hasData).toBe(true);
    });

    it('should set hasData correctly when product and plan are falsy but category exists (line 16)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd', // truthy category
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        // product and plan are undefined/falsy
      };

      const result = transformDetails(apiPackage, 'en');

      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      // hasData should be true because category exists (even if product/plan are falsy)
      expect(coverageSection?.hasData).toBe(true);
    });

    it('should set hasData to true when at least one of category, product, or plan exists (line 16)', () => {
      const apiPackage = {
        name: 'packages/test-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '1000000' },
          },
        },
        product: { name: 'Test Product' },
        plan: { name: 'Test Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      // hasData should be true because category, product, and plan all exist
      expect(coverageSection?.hasData).toBe(true);
    });
  });

  describe('Integration: Lines 5-12 together', () => {
    it('should handle complete flow from destructuring to section creation', () => {
      const apiPackage = {
        name: 'packages/comprehensive-package',
        category: 'ipdOpd',
        coverages: {
          ipdopd_sum_insured_per_year: {
            limitValue: { units: '2000000' },
          },
          ipdopd_sum_insured_per_time: {
            limitValue: null,
            displayNameEn: 'Per Time Coverage',
            displayNameTh: 'ความคุ้มครองต่อครั้ง',
          },
        },
        product: { name: 'Comprehensive Product' },
        plan: { name: 'Premium Plan' },
      };

      const result = transformDetails(apiPackage, 'en');

      // Verify the function executed successfully
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify package detail section exists
      const packageDetailSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.packageDetail'
      );
      expect(packageDetailSection).toBeDefined();

      // Verify coverage section was created
      const coverageSection = result.find(
        (section: any) => section.title === 'healthPackageDetail.titles.inpatient_hos_surgery'
      );
      expect(coverageSection).toBeDefined();
      expect(coverageSection.packages).toEqual(['packages/comprehensive-package']);
    });
  });
});
