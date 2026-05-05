import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { act, renderHook, waitFor } from '__tests__/rtl-test-utils';

import useTransformedPackages, {
  handleSortData,
  queryStringFilter,
} from './useTransformedPackages';

var mockShowSnackBar: jest.Mock;
var mockSortAndfilter: jest.Mock;
var mockUseLazyGetPackagesQuery: jest.Mock;
var actualUseLazyGetPackagesQuery: any;

jest.mock('data/slices/packageListing', () => {
  const actual = jest.requireActual('data/slices/packageListing');
  actualUseLazyGetPackagesQuery = actual.useLazyGetPackagesQuery;
  mockUseLazyGetPackagesQuery = jest.fn((...args: any[]) =>
    actualUseLazyGetPackagesQuery(...args)
  );
  return {
    ...actual,
    useLazyGetPackagesQuery: (...args: any[]) =>
      mockUseLazyGetPackagesQuery(...args),
  };
});

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetProductSelector: jest.fn().mockReturnValue('products/car-insurance'),
}));

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackBar,
  };
});

jest.mock('@careos/sorting-filtering', () => {
  mockSortAndfilter = jest.fn(() => ({
    normalPackages: [],
    customPackages: [],
  }));
  return mockSortAndfilter;
});

const leadId = '00000000-0000-0000-0000-000000000000';
const filterValues = {
  sortBy: 'default',
  insuranceType: {
    'Type 1': false,
    'Type 2': false,
    'Type 3': false,
    'Type 2+': false,
    'Type 3+': false,
  },
  repairType: 'both',
  deductible: 'no_deductible',
  price: {
    min: 646,
    max: 25646,
  },
  sumInsured: {
    min: 0,
    max: 710000,
  },
  insurer: {
    'insurers/7': true,
    'insurers/27': true,
    'insurers/35': true,
    'insurers/24': true,
    'insurers/19': true,
    'insurers/11': true,
    'insurers/17': true,
    'insurers/25': true,
  },
  isDefaultSumInsured: true,
};

describe('error handling on useTransformedPackages', () => {
  beforeEach(() => {
    mockShowSnackBar.mockClear();
    mockSortAndfilter.mockClear();
    mockUseLazyGetPackagesQuery.mockImplementation((...args: any[]) =>
      actualUseLazyGetPackagesQuery(...args)
    );
  });

  it('should show snackbar with error message "errors.productTypeMissing" when api return error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/${leadId}/packages:search`,
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'validation error',
              details: [
                {
                  '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                  reason: 'REQUEST_VALIDATION_ERROR',
                  metadata: {
                    detail: 'invalid lead',
                    field: 'product_type',
                    rule: 'required.product_type',
                  },
                },
              ],
            },
            { status: 400 }
          )
      )
    );

    renderHook(() =>
      useTransformedPackages(
        leadId,
        filterValues as any,
        true,
        { brand: '24', model: '183', carSubModelYear: 2022 },
        false
      )
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errors.productTypeMissing',
        status: 'error',
      })
    );
  });

  it('should show snackbar with error message "errors.leadMissingInvalid" when api return error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/${leadId}/packages:search`,
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'validation error',
              details: [
                {
                  '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                  reason: 'REQUEST_VALIDATION_ERROR',
                  metadata: {
                    detail: 'product does not exist',
                    field: 'lead',
                    rule: 'invalid_uuid.lead',
                  },
                },
              ],
            },
            { status: 400 }
          )
      )
    );

    renderHook(() =>
      useTransformedPackages(
        leadId,
        filterValues as any,
        true,
        { brand: '24', model: '183', carSubModelYear: 2022 },
        false
      )
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errors.leadMissingInvalid',
        status: 'error',
      })
    );
  });

  it('should show snackbar with error message "errors.minGreaterMax" when api return error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/${leadId}/packages:search`,
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'validation error',
              details: [
                {
                  '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                  reason: 'REQUEST_VALIDATION_ERROR',
                  metadata: {
                    detail:
                      'sum_insured_min cannot be greater than sum_insured_max',
                    field: 'sum_insured_max',
                    rule: 'less_than.sum_insured_max',
                  },
                },
              ],
            },
            { status: 400 }
          )
      )
    );

    renderHook(() =>
      useTransformedPackages(
        leadId,
        filterValues as any,
        true,
        { brand: '24', model: '183', carSubModelYear: 2022 },
        false
      )
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errors.minGreaterMax',
        status: 'error',
      })
    );
  });

  it('should show snackbar with error message "errors.invalidSubmodelPackageSearch" when api return error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/${leadId}/packages:search`,
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'validation error',
              details: [
                {
                  '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                  reason: 'RESOURCE_NOT_FOUND',
                  metadata: {
                    resouce: '/brands/-/models/-/submodels/-/years/12345',
                    serviceFailure: 'rf-car',
                  },
                },
              ],
            },
            { status: 400 }
          )
      )
    );

    renderHook(() =>
      useTransformedPackages(
        leadId,
        filterValues as any,
        true,
        { brand: '24', model: '183', carSubModelYear: 2022 },
        false
      )
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errors.resourceNotFound',
        status: 'error',
      })
    );
  });

  it('should used currency convrted filter if satangToBth is enabled', () => {
    renderHook(() => useTransformedPackages(leadId, filterValues as any));
    expect(mockSortAndfilter.mock.calls[0][2]).toStrictEqual({
      sortBy: 'default',
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
      repairType: 'both',
      deductible: 'no_deductible',
      price: {
        max: BigInt(2564600),
        min: BigInt(64600),
      },
      sumInsured: {
        min: BigInt(0),
        max: BigInt(71000000),
      },
      insurer: {
        'insurers/7': true,
        'insurers/27': true,
        'insurers/35': true,
        'insurers/24': true,
        'insurers/19': true,
        'insurers/11': true,
        'insurers/17': true,
        'insurers/25': true,
      },
      isDefaultSumInsured: true,
    });
  });
  it('should call refetch function when refetch is triggered', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useTransformedPackages(leadId, filterValues as any)
    );
    await waitFor(() => {
      expect(result.current.refetch).toBeDefined();
    });
    result.current.refetch();
    jest.advanceTimersByTime(1000);
    expect(result.current.refetch).toBeDefined();
    jest.useRealTimers();
  });

  it('should not call api refetch when query is uninitialized', async () => {
    const refetchSpy = jest.fn();
    mockUseLazyGetPackagesQuery.mockReturnValueOnce([
      refetchSpy,
      {
        data: undefined,
        isLoading: false,
        error: undefined,
        isFetching: false,
        isUninitialized: true,
      },
    ] as any);

    const { result } = renderHook(() =>
      useTransformedPackages(leadId, filterValues as any)
    );

    await act(async () => {
      const response = await result.current.refetch();
      expect(response).toBeUndefined();
    });

    expect(refetchSpy).not.toHaveBeenCalled();
  });

  it('should fetch packages again when insurance category filter changes', async () => {
    const getPackagesSpy = jest.fn();
    mockUseLazyGetPackagesQuery.mockReturnValue([
      getPackagesSpy,
      {
        data: undefined,
        isLoading: false,
        error: undefined,
        isFetching: false,
        isUninitialized: false,
      },
    ] as any);

    const searchFilter = {
      brand: '24',
      model: '183',
      carSubModelYear: 2022,
    };
    const { rerender } = renderHook(
      ({ insuranceCategory }) =>
        useTransformedPackages(
          leadId,
          { ...filterValues, insuranceCategory } as any,
          true,
          searchFilter
        ),
      {
        initialProps: { insuranceCategory: 'voluntary' },
      }
    );

    await waitFor(() =>
      expect(getPackagesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ insuranceKind: 'voluntary' })
      )
    );

    rerender({ insuranceCategory: 'both' });

    await waitFor(() =>
      expect(getPackagesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ insuranceKind: 'both' })
      )
    );
    expect(getPackagesSpy).toHaveBeenCalledTimes(2);
  });

  it('should update manual packages when insurance category filter changes', () => {
    mockSortAndfilter.mockReturnValue({
      normalPackages: [],
      customPackages: [
        {
          name: 'packages/manual-1',
          displayName: 'Manual package',
          canBuy: true,
          expireTime: '9999-01-01T00:00:00Z',
          carInsuranceType: 'Type 1',
          insuranceCategory: 'voluntary',
          packageSource: 'manual',
          sumCoverage: '0',
          deductibleAmount: '0',
          invoicePrice: '100000',
          grossMandatoryPremium: '0',
          grossVoluntaryPremium: '0',
          originalPrice: '100000',
          carDiscountAmount: '0',
          carDiscountPercentage: 0,
          couponDiscountAmount: '0',
          installmentDetails: [],
          insuranceCompany: {
            logo: '',
            rating: 0,
            shortnameEn: 'Manual',
            shortnameTh: 'Manual',
          },
        },
      ],
    });

    const { result, rerender } = renderHook(
      ({ insuranceCategory }) =>
        useTransformedPackages(leadId, {
          ...filterValues,
          insuranceCategory,
        } as any),
      {
        initialProps: { insuranceCategory: 'voluntary' },
      }
    );

    expect(result.current.manualRenewalImportPackages[0].insuranceKind).toBe(
      'voluntary'
    );

    rerender({ insuranceCategory: 'both' });

    expect(result.current.manualRenewalImportPackages[0].insuranceKind).toBe(
      'both'
    );
  });

  it('should fetch packages for new search when car year is present without carSubModelYear', async () => {
    const getPackagesSpy = jest.fn();
    mockUseLazyGetPackagesQuery.mockReturnValue([
      getPackagesSpy,
      {
        data: undefined,
        isLoading: false,
        error: undefined,
        isFetching: false,
        isUninitialized: false,
      },
    ] as any);

    renderHook(() =>
      useTransformedPackages(leadId, filterValues as any, true, {
        brand: '54',
        model: '616',
        year: 2014,
        province: 100000,
        drivingPurpose: 'PERSONAL',
        dashCam: true,
        noOfDoors: 4,
        engineSize: 2500,
      })
    );

    await waitFor(() =>
      expect(getPackagesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: '54',
          model: '616',
          year: 2014,
          newSearch: true,
        })
      )
    );
  });

  it('should not fetch packages for new search without carSubModelYear or year', async () => {
    const getPackagesSpy = jest.fn();
    mockUseLazyGetPackagesQuery.mockReturnValue([
      getPackagesSpy,
      {
        data: undefined,
        isLoading: false,
        error: undefined,
        isFetching: false,
        isUninitialized: false,
      },
    ] as any);

    renderHook(() =>
      useTransformedPackages(leadId, filterValues as any, true, {
        brand: '54',
        model: '616',
        province: 100000,
        drivingPurpose: 'PERSONAL',
        dashCam: true,
        noOfDoors: 4,
        engineSize: 2500,
      })
    );

    await waitFor(() => {
      expect(getPackagesSpy).not.toHaveBeenCalled();
    });
  });
});

describe('useTransformedPackages helpers', () => {
  it('sorts package data by numeric string values', () => {
    const result = handleSortData(
      [
        { displayName: 'Package B', invoicePrice: '2,000' },
        { displayName: 'Package A', invoicePrice: '1,000' },
      ],
      'premium',
      'asc'
    );

    expect(result.map((pkg) => pkg.displayName)).toEqual([
      'Package A',
      'Package B',
    ]);
  });

  it('sorts package data by nested string values without object stringification', () => {
    const result = handleSortData(
      [
        { displayName: 'Package B', priceSummary: { discountAmount: {} } },
        { displayName: 'Package A', priceSummary: { discountAmount: '100' } },
      ],
      'discount',
      'desc'
    );

    expect(result.map((pkg) => pkg.displayName)).toEqual([
      'Package A',
      'Package B',
    ]);
  });

  it('keeps false boolean values in new-search query params', () => {
    expect(
      queryStringFilter({
        brand: '54',
        model: '616',
        year: 2014,
        dashCam: false,
        modification: false,
      })
    ).toEqual({
      brand: '54',
      model: '616',
      year: 2014,
      hasCarDashcam: false,
      modification: false,
      newSearch: true,
    });
  });
});
