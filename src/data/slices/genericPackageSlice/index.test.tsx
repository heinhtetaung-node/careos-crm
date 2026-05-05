import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { HttpResponse, http } from 'msw';
import { renderHook } from '@testing-library/react-hooks';
import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { act, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from '../apiSlice';
import {
  useGetGenericPackagesQuery,
  useLazyGetGenericPackagesQuery,
  useLazyGetGenericPackageDetailQuery,
  GenericPackageTransformResponse,
  calculateInsurancePricing,
} from '.';
import { mockGenericPackageApiResponse as mockApiResponse } from 'mock-data/GenericPackageApiResponse.mock';
import { mockPackageDetailResponse } from 'mock-data/GenericPackageDetailResponse.mock';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>;

jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn(() => ({})),
}));

jest.mock('utils/url', () => ({
  buildUrl: jest.fn((baseUrl, options) => `${baseUrl}/${options.path}`),
}));
jest.mock('../helper', () => ({
  __esModule: true,
  default: jest.fn((_params) => 'mocked-query-params'),
}));
const storeRef = setupApiStore(apiSlice);
function Wrapper({
  children,
}: PropsWithChildren<Record<string, never>>): JSX.Element {
  return <Provider store={storeRef.store}>{children}</Provider>;
}
describe('genericPackageSlice', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4545_ENABLE_PROVINCE_FILTER_20260225_TEMP]: {
        enabled: true,
      },
    } as any);
  });
  afterAll(() => server.close());
  describe('getGenericPackages query', () => {
    it('should fetch and transform packages successfully', async () => {
      server.use(
        http.post('*/api/gff/v1alpha1/car-insurance/packages:search', () =>
          HttpResponse.json(mockApiResponse)
        )
      );
      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'honda' },
          }),
        {
          wrapper: Wrapper,
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const data = result.current.data as GenericPackageTransformResponse;
      expect(data.packages).toHaveLength(2); // 2 insurers: 27 and 26
      expect(data.total).toBe(3); // 3 total packages
      expect(data.nextToken).toBe(mockApiResponse.nextToken);
      const insurer27Group = data.packages.find(
        (pkg) => pkg.name === 'Insurer 27'
      );
      expect(insurer27Group?.packages).toHaveLength(2);
      expect(insurer27Group?.priceRange.min).toBe(15300);
      expect(insurer27Group?.priceRange.max).toBe(64521);
      expect(insurer27Group?.priceRange.highlighted).toBe(15300);
      const insurer26Group = data.packages.find(
        (pkg) => pkg.name === 'Insurer 26'
      );
      expect(insurer26Group).toBeDefined();
      expect(insurer26Group?.packages).toHaveLength(1);
      expect(insurer26Group?.priceRange.min).toBe(64521);
      expect(insurer26Group?.priceRange.max).toBe(64521);
      expect(insurer26Group?.priceRange.highlighted).toBe(64521);
    });
    it('should transform package data correctly', async () => {
      server.use(
        http.post('*/api/gff/v1alpha1/car-insurance/packages:search', () =>
          HttpResponse.json(mockApiResponse)
        )
      );
      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'honda' },
          }),
        {
          wrapper: Wrapper,
        }
      );
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      const data = result.current.data as GenericPackageTransformResponse;
      const insurer27Group = data.packages.find(
        (pkg) => pkg.name === 'Insurer 27'
      );
      const firstPackage = insurer27Group?.packages[0];
      expect(firstPackage?.uploadPackageName).toBe('Insurer 27');
      expect(firstPackage?.packageName).toBe(
        'packages/2c2d5efb-f0eb-4c9b-ac39-9df4d4b98d83'
      );
      expect(firstPackage?.carCoverage).toBe(100000);
      expect(firstPackage?.price).toBe(64521);
      expect(firstPackage?.insuranceCompany).toBe('Insurance Company 27');

      expect(firstPackage?.startDate).toEqual(new Date('2025-01-01T00:00:00Z'));
      expect(firstPackage?.expiryDate).toEqual(
        new Date('2025-12-31T00:00:00Z')
      );
      expect(firstPackage?.mandatoryPricePerYear).toBe(0);
      expect(firstPackage?.premium).toBe(64521);
      expect(firstPackage?.insuranceType).toBe('Type 1');
      expect(firstPackage?.repairType).toBe('Garage repair');
      expect(firstPackage?.subModel).toBe('BMW220I');
      expect(firstPackage?.insuranceCategory).toBe('Unknown');
      expect(firstPackage?.termsAndConditions).toBe('Standard coverage');
      expect(firstPackage?.applicableProvinces).toEqual(['All provinces']);
    });
    it('should calculate price ranges correctly for multiple packages', async () => {
      server.use(
        http.post('*/api/gff/v1alpha1/car-insurance/packages:search', () =>
          HttpResponse.json(mockApiResponse)
        )
      );
      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'honda' },
          }),
        {
          wrapper: Wrapper,
        }
      );
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      const data = result.current.data as GenericPackageTransformResponse;
      const insurer27Group = data.packages.find(
        (pkg) => pkg.name === 'Insurer 27'
      );
      expect(insurer27Group?.priceRange.min).toBe(15300);
      expect(insurer27Group?.priceRange.max).toBe(64521);
      expect(insurer27Group?.priceRange.highlighted).toBe(15300);
    });

    it('should normalize hyphenated brand values before sending criteria', async () => {
      let capturedBody: any;
      server.use(
        http.post(
          '*/api/gff/v1alpha1/car-insurance/packages:search',
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(mockApiResponse);
          }
        )
      );

      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'Mercedes-Benz' },
          }),
        {
          wrapper: Wrapper,
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(capturedBody).toBeDefined();
      expect(capturedBody.criteria.brand).toBe('mercedesbenz');
      expect(capturedBody.productType).toBe('motorinsurance-mercedesbenz');
    });

    it('should normalize spaced brand values before sending criteria', async () => {
      let capturedBody: any;
      server.use(
        http.post(
          '*/api/gff/v1alpha1/car-insurance/packages:search',
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(mockApiResponse);
          }
        )
      );

      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'Land Rover' },
          }),
        {
          wrapper: Wrapper,
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(capturedBody).toBeDefined();
      expect(capturedBody.criteria.brand).toBe('landrover');
      expect(capturedBody.productType).toBe('motorinsurance-landrover');
    });

    it.each([
      {
        description:
          'should include province in provinces array when province is provided',
        province: 10,
        expectedProvinces: ['0', '10'],
        uniqueKey: 'with-province',
      },
      {
        description:
          'should only include 0 in provinces array when province is undefined',
        province: undefined,
        expectedProvinces: ['0'],
        uniqueKey: 'without-province-undefined',
      },
      {
        description:
          'should only include 0 in provinces array when province is null',
        province: null,
        expectedProvinces: ['0'],
        uniqueKey: 'without-province-null',
      },
    ])('$description', async ({ province, expectedProvinces, uniqueKey }) => {
      let capturedBody: {
        criteria: {
          provinces: string[];
          brand?: string;
          year?: number;
          model?: string;
          submodel?: string;
          vehicleregistrationpurpose?: string[];
          dashcam?: string[];
          maximumannualcoveragemin?: number;
          maximumannualcoveragemax?: number;
          insurancetype?: string[];
          repairtype?: string[];
          deductible?: string[];
          insurer?: number[];
        };
        productType?: string;
        cursor?: {
          sortBy?: string;
          direction?: string;
          limit?: number;
          token?: string;
        };
      };
      server.use(
        http.post(
          '*/api/gff/v1alpha1/car-insurance/packages:search',
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(mockApiResponse);
          }
        )
      );

      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: {
              year: 2024,
              brand: 'honda',
              sortBy: uniqueKey, // Add unique sortBy to make queryParams unique
              ...(province != null ? { province: province.toString() } : {}),
              enableProvinceFilter: true, // Ensure province filter is enabled for the test
            },
          }),
        {
          wrapper: Wrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(capturedBody).toBeDefined();
      });

      expect(capturedBody.criteria.provinces).toEqual(expectedProvinces);
    });
  });
  describe('useLazyGetGenericPackagesQuery', () => {
    it('should trigger query manually', async () => {
      server.use(
        http.post('*/api/gff/v1alpha1/car-insurance/packages:search', () =>
          HttpResponse.json(mockApiResponse)
        )
      );
      const { result } = renderHook(() => useLazyGetGenericPackagesQuery(), {
        wrapper: Wrapper,
      });
      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();
      act(() => {
        result.current[0]({ queryParams: { year: 2024, brand: 'honda' } });
      });
      await waitFor(() => expect(result.current[1].isLoading).toBe(false));
      expect(result.current[1].isSuccess).toBe(true);
      expect(result.current[1].data).toBeDefined();
    });
  });
  describe('useLazyGetGenericPackageDetailQuery', () => {
    it('should trigger package detail query manually', async () => {
      server.use(
        http.get('*/api/car-package/v1alpha1/*', () =>
          HttpResponse.json(mockPackageDetailResponse)
        )
      );
      const { result } = renderHook(
        () => useLazyGetGenericPackageDetailQuery(),
        {
          wrapper: Wrapper,
        }
      );
      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();
      act(() => {
        result.current[0]({
          id: 'premiums/test-package-id',
          carSubModelYear: 2024,
          insuranceKind: 'VOLUNTARY',
        });
      });
      await waitFor(() => {
        expect(result.current[1].isLoading).toBe(false);
      });
      expect(result.current[1].isSuccess).toBe(true);
      expect(result.current[1].data).toBeDefined();
      expect(result.current[1].data).toEqual(mockPackageDetailResponse);
    });
  });
  describe('API configuration', () => {
    it('should use correct endpoint and method', async () => {
      const mockBuildUrl = jest.requireMock('utils/url').buildUrl;
      server.use(
        http.post('*/api/gff/v1alpha1/car-insurance/packages:search', () =>
          HttpResponse.json(mockApiResponse)
        )
      );
      const { result } = renderHook(
        () =>
          useGetGenericPackagesQuery({
            queryParams: { year: 2024, brand: 'honda' },
          }),
        {
          wrapper: Wrapper,
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockBuildUrl).toHaveBeenCalledWith(expect.any(String), {
        path: '/api/gff/v1alpha1/car-insurance/packages:search',
      });
    });
  });
});

describe('calculateInsurancePricing', () => {
  const mockPackageDetail = {
    voluntaryPrice: {
      units: '1000',
      nanos: 500000000, // 0.5
    },
    mandatoryPrice: {
      units: '2000',
      nanos: 0,
    },
  };

  const mockPackageDetailWithoutPrices = {
    voluntaryPrice: null,
    mandatoryPrice: null,
  };

  const mockPackageDetailWithZeroPrices = {
    voluntaryPrice: {
      units: '0',
      nanos: 0,
    },
    mandatoryPrice: {
      units: '0',
      nanos: 0,
    },
  };

  describe('Mandatory insurance type', () => {
    it('should return totalPrice as mandatoryPricePerYear and 0 as premium', () => {
      const result = calculateInsurancePricing(
        'Mandatory',
        5000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 5000,
        premium: 0,
      });
    });

    it('should work with different totalPrice values', () => {
      const result = calculateInsurancePricing(
        'Mandatory',
        10000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 10000,
        premium: 0,
      });
    });
  });

  describe('Combined insurance types (includes " Mandatory")', () => {
    it('should use mandatoryPrice when available and voluntaryPrice when available', () => {
      const result = calculateInsurancePricing(
        'Type 1 Mandatory',
        5000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 2000, // mandatoryPrice
        premium: 1000.5, // voluntaryPrice (1000 + 0.5)
      });
    });

    it('should fallback to totalPrice when mandatoryPrice is not available', () => {
      const result = calculateInsurancePricing(
        'Type 2 Mandatory',
        5000,
        mockPackageDetailWithoutPrices
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 5000, // totalPrice fallback
        premium: 5000, // totalPrice fallback
      });
    });

    it('should fallback to totalPrice when voluntaryPrice is not available', () => {
      const result = calculateInsurancePricing(
        'Type 3 Mandatory',
        5000,
        mockPackageDetailWithoutPrices
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 5000, // totalPrice fallback
        premium: 5000, // totalPrice fallback
      });
    });

    it('should handle zero prices correctly', () => {
      const result = calculateInsurancePricing(
        'Type 1 Mandatory',
        5000,
        mockPackageDetailWithZeroPrices
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 5000, // totalPrice fallback (0 is falsy)
        premium: 5000, // totalPrice fallback (0 is falsy)
      });
    });

    it('should work with different combined insurance types that match regex pattern', () => {
      const testCases = [
        'Type 1 Mandatory',
        'Type 2 Mandatory',
        'Type 3 Mandatory',
        'Type 1+ Mandatory',
        'Type 2+ Mandatory',
        'Type 3+ Mandatory',
        'Type 10 Mandatory',
        'Type 99 Mandatory',
        'Type 10+ Mandatory',
      ];

      testCases.forEach((insuranceType) => {
        const result = calculateInsurancePricing(
          insuranceType,
          3000,
          mockPackageDetail
        );

        expect(result).toEqual({
          mandatoryPricePerYear: 2000, // mandatoryPrice
          premium: 1000.5, // voluntaryPrice
        });
      });
    });

    it('should NOT match combined insurance types that do not match regex pattern', () => {
      const testCases = [
        'Some Other Mandatory', // Doesn't start with "Type "
        'Type Mandatory', // Missing number
        'Type 1 Mandatory Extra', // Has extra text after "Mandatory"
        'Type + Mandatory', // Missing number before +
        'Type 1+ Mandatory Extra', // Has extra text after "Mandatory"
      ];

      testCases.forEach((insuranceType) => {
        const result = calculateInsurancePricing(
          insuranceType,
          3000,
          mockPackageDetail
        );

        // These should fall through to voluntary insurance type logic
        expect(result).toEqual({
          mandatoryPricePerYear: 0,
          premium: 3000, // totalPrice
        });
      });
    });
  });

  describe('Voluntary insurance types', () => {
    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for Type 1', () => {
      const result = calculateInsurancePricing(
        'Type 1',
        5000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 5000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for Type 2', () => {
      const result = calculateInsurancePricing(
        'Type 2',
        3000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 3000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for Type 3', () => {
      const result = calculateInsurancePricing(
        'Type 3',
        4000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 4000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for Type 2+', () => {
      const result = calculateInsurancePricing(
        'Type 2+',
        6000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 6000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for Type 3+', () => {
      const result = calculateInsurancePricing(
        'Type 3+',
        7000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 7000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for unknown types', () => {
      const result = calculateInsurancePricing(
        'Unknown Type',
        8000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 8000,
      });
    });

    it('should return 0 as mandatoryPricePerYear and totalPrice as premium for empty string', () => {
      const result = calculateInsurancePricing('', 9000, mockPackageDetail);

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 9000,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null insuranceType', () => {
      const result = calculateInsurancePricing(
        null as any,
        5000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 5000,
      });
    });

    it('should handle undefined insuranceType', () => {
      const result = calculateInsurancePricing(
        undefined as any,
        5000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 5000,
      });
    });

    it('should handle zero totalPrice', () => {
      const result = calculateInsurancePricing('Type 1', 0, mockPackageDetail);

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: 0,
      });
    });

    it('should handle negative totalPrice', () => {
      const result = calculateInsurancePricing(
        'Type 1',
        -1000,
        mockPackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 0,
        premium: -1000,
      });
    });

    it('should handle packageDetail with missing voluntaryPrice and mandatoryPrice properties', () => {
      const incompletePackageDetail = {};
      const result = calculateInsurancePricing(
        'Type 1 Mandatory',
        5000,
        incompletePackageDetail
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 5000, // totalPrice fallback
        premium: 5000, // totalPrice fallback
      });
    });
  });

  describe('convertMonetaryValue integration', () => {
    it('should correctly convert monetary values with nanos', () => {
      const packageDetailWithNanos = {
        voluntaryPrice: {
          units: '1000',
          nanos: 500000000, // 0.5
        },
        mandatoryPrice: {
          units: '2000',
          nanos: 250000000, // 0.25
        },
      };

      const result = calculateInsurancePricing(
        'Type 1 Mandatory',
        5000,
        packageDetailWithNanos
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 2000.25, // 2000 + 0.25
        premium: 1000.5, // 1000 + 0.5
      });
    });

    it('should handle monetary values with only units', () => {
      const packageDetailWithUnitsOnly = {
        voluntaryPrice: {
          units: '1500',
          nanos: 0,
        },
        mandatoryPrice: {
          units: '2500',
          nanos: 0,
        },
      };

      const result = calculateInsurancePricing(
        'Type 1 Mandatory',
        5000,
        packageDetailWithUnitsOnly
      );

      expect(result).toEqual({
        mandatoryPricePerYear: 2500,
        premium: 1500,
      });
    });
  });
});
