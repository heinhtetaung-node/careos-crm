import { act, renderHook, waitFor } from '@testing-library/react';
import type { AggregationCriteriaInput } from '../model/insurancePackageApi.types';
import { useEnhancedPackageListController } from './useEnhancedPackageListController';
import {
  buildAggregationRequest,
  buildSearchRequest,
  useGetInsurancePackageAggregationMutation,
  useGetInsurancePackageSearchMutation,
  useLazyGetInsurancePremiumDetailQuery,
} from '../model/insurancePackageApi';
import premiumDetailProductToPremiumToPackage from '../model/premiumDetailToPackage';
import { transformPremiumToPackage } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getPackageDetailUrl } from 'presentation/routes/Urls';

const mockNavigate = jest.fn();
const mockFetchAggregation = jest.fn();
const mockFetchSearch = jest.fn();
const mockFetchPremiumDetail = jest.fn();
const mockHandleOpenPackage = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn(() => 'lead-1'),
}));

jest.mock('presentation/routes/Urls', () => ({
  getPackageDetailUrl: jest.fn(() => '/lead-1/package/pkg-1'),
}));

jest.mock('../model/insurancePackageApi', () => ({
  useGetInsurancePackageAggregationMutation: jest.fn(),
  useGetInsurancePackageSearchMutation: jest.fn(),
  useLazyGetInsurancePremiumDetailQuery: jest.fn(),
  buildAggregationRequest: jest.fn((criteria) => ({ criteria })),
  buildSearchRequest: jest.fn((criteria, options) => ({ criteria, options })),
}));

jest.mock('../model/premiumDetailToPackage', () => jest.fn());
jest.mock(
  '../../helper',
  () => ({
    getPremiumAttrs: jest.fn(() => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: 'Premium',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    })),
    getPremiumIdFromName: jest.fn((name) => `id-${name}`),
    SEARCH_PAGE_SIZE: 20,
  }),
  { virtual: true }
);
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    transformPremiumToPackage: jest.fn((pkg) => ({
      ...pkg,
      insuranceCompany: { id: 'insurer' },
    })),
  })
);
jest.mock(
  './useInsurerNameController',
  () =>
    jest.fn(() => ({
      getInsurerName: jest.fn(() => 'Alpha Insurance'),
    })),
  { virtual: true }
);

const helperModule = jest.requireMock('../../helper');

const baseCriteria: AggregationCriteriaInput = {
  year: 2024,
  brandText: 'Toyota',
  modelText: 'Yaris',
  subModelText: 'Premium',
};

function renderController(
  overrides: Partial<
    Parameters<typeof useEnhancedPackageListController>[0]
  > = {}
) {
  return renderHook(() =>
    useEnhancedPackageListController({
      genericPackages: { total: 12 } as any,
      isLoading: false,
      aggregationCriteria: undefined,
      filterTopKey: 'k1',
      sortBy: 'price',
      sortDirection: 'asc',
      handleOpenPackage: mockHandleOpenPackage,
      addForComparison: jest.fn(),
      ...overrides,
    })
  );
}

describe('useEnhancedPackageListController', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useGetInsurancePackageAggregationMutation as jest.Mock).mockReturnValue([
      mockFetchAggregation,
      { isLoading: false },
    ]);
    (useGetInsurancePackageSearchMutation as jest.Mock).mockReturnValue([
      mockFetchSearch,
      { isLoading: false },
    ]);
    (useLazyGetInsurancePremiumDetailQuery as jest.Mock).mockReturnValue([
      mockFetchPremiumDetail,
    ]);
    helperModule.getPremiumAttrs.mockReturnValue({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: 'Premium',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    });

    mockFetchAggregation.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ totalPackages: '8' }),
    });
    mockFetchSearch.mockReturnValue({
      unwrap: jest
        .fn()
        .mockResolvedValue({ premiums: [{ name: 'P1' }], nextToken: 'n2' }),
    });
    mockFetchPremiumDetail.mockResolvedValue({
      data: {
        product: {
          insuranceCategory: 'mandatory',
          coverages: [
            { coverageType: 'termAndConditionEN', textValue: 'Default EN T&C' },
          ],
        },
      },
    });
    (premiumDetailProductToPremiumToPackage as jest.Mock).mockReturnValue({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Dealer',
      insuranceCategory: 'mandatory',
      insuranceCompany: {},
    });
    (transformPremiumToPackage as jest.Mock).mockReturnValue({
      insuranceCompany: { id: 'insurer' },
    });
  });

  it('returns base state and fallback total from generic packages', () => {
    const { result } = renderController();

    expect(result.current.totalCount).toBe('12');
    expect(result.current.displayLoading).toBe(false);
    expect(result.current.expandedInsurerId).toBeNull();
    expect(result.current.searchResultsByInsurer).toEqual({});
  });

  it('falls back totalCount to 0 when generic total is missing', () => {
    const { result } = renderController({ genericPackages: {} as any });

    expect(result.current.totalCount).toBe('0');
  });

  it('loads aggregation successfully and updates total count', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await waitFor(() => expect(mockFetchAggregation).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.totalCount).toBe('8'));

    mockFetchAggregation.mockClear();
    await act(async () => {
      await result.current.loadAggregation();
    });

    expect(buildAggregationRequest).toHaveBeenCalledWith(baseCriteria);
    expect(mockFetchAggregation).toHaveBeenCalledTimes(1);
  });

  it('skips loadAggregation without required criteria', async () => {
    const { result } = renderController({
      aggregationCriteria: { modelText: 'Yaris' } as AggregationCriteriaInput,
    });

    await act(async () => {
      await result.current.loadAggregation();
    });

    expect(mockFetchAggregation).not.toHaveBeenCalled();
  });

  it('does not auto-fetch aggregation when required criteria are missing', () => {
    renderController({
      aggregationCriteria: { year: 2024 } as AggregationCriteriaInput,
    });

    expect(mockFetchAggregation).not.toHaveBeenCalled();
  });

  it('sorts selected insurers before creating aggregation request', async () => {
    renderController({
      aggregationCriteria: {
        ...baseCriteria,
        selectedInsurers: ['z-insurer', 'a-insurer', 'm-insurer'],
      },
    });

    await waitFor(() => expect(mockFetchAggregation).toHaveBeenCalledTimes(1));
    expect(buildAggregationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedInsurers: ['a-insurer', 'm-insurer', 'z-insurer'],
      })
    );
  });

  it('keeps fallback total when initial aggregation effect fails', async () => {
    mockFetchAggregation.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('aggregation failed')),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await waitFor(() => expect(mockFetchAggregation).toHaveBeenCalledTimes(1));
    expect(result.current.aggregationData).toBeNull();
    expect(result.current.totalCount).toBe('12');
  });

  it('sets aggregation data to null when loadAggregation throws', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await waitFor(() => expect(result.current.totalCount).toBe('8'));

    mockFetchAggregation.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('aggregation failed')),
    });

    await act(async () => {
      await result.current.loadAggregation();
    });

    expect(result.current.aggregationData).toBeNull();
    expect(result.current.totalCount).toBe('12');
  });

  it('expands insurer and fetches search results, then collapses and clears cache', async () => {
    const { result } = renderController({
      aggregationCriteria: baseCriteria,
      sortBy: 'maximumannualcoverage',
      sortDirection: 'desc',
    });

    await waitFor(() => expect(mockFetchAggregation).toHaveBeenCalled());

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    expect(result.current.expandedInsurerId).toBe('ins-1');
    expect(buildSearchRequest).toHaveBeenCalledWith(
      baseCriteria,
      expect.objectContaining({
        insurerId: 'ins-1',
        sortBy: 'maximumannualcoverage',
        direction: 'desc',
      })
    );
    expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
      { name: 'P1' },
    ]);

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    expect(result.current.expandedInsurerId).toBeNull();
    expect(result.current.searchResultsByInsurer['ins-1']).toBeUndefined();
  });

  it('returns 0 on fetchMoreInsurer when token is missing', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    const added = await act(async () =>
      result.current.fetchMoreInsurer('ins-1')
    );

    expect(added).toBe(0);
    expect(mockFetchSearch).not.toHaveBeenCalled();
  });

  it('appends search results on fetchMoreInsurer success', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    mockFetchSearch.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P2' }],
        nextToken: '',
      }),
    });

    let added = 0;
    await act(async () => {
      added = await result.current.fetchMoreInsurer('ins-1');
    });

    expect(added).toBe(1);
    expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
      { name: 'P1' },
      { name: 'P2' },
    ]);
  });

  it('sets empty state when toggleInsurer search fails', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    mockFetchSearch.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('search failed')),
    });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    expect(result.current.searchResultsByInsurer['ins-1']).toEqual([]);
    expect(result.current.nextTokenByInsurer['ins-1']).toBeUndefined();
  });

  it('returns 0 from fetchMoreInsurer on request error', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    mockFetchSearch.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('fetch more failed')),
    });

    let added = -1;
    await act(async () => {
      added = await result.current.fetchMoreInsurer('ins-1');
    });

    expect(added).toBe(0);
    expect(result.current.loadingMoreInsurerId).toBeNull();
  });

  it('handleScroll triggers fetchMore only when at bottom with next token', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    mockFetchSearch.mockClear();
    mockFetchSearch.mockReturnValueOnce({
      unwrap: jest.fn().mockResolvedValue({ premiums: [], nextToken: '' }),
    });

    act(() => {
      result.current.handleScroll(
        {
          currentTarget: {
            scrollTop: 91,
            clientHeight: 10,
            scrollHeight: 100,
          },
        } as React.UIEvent<HTMLDivElement>,
        'ins-1'
      );
    });

    await waitFor(() => expect(mockFetchSearch).toHaveBeenCalledTimes(1));
  });

  it('handleScroll does not fetch when list is not at bottom', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    mockFetchSearch.mockClear();
    act(() => {
      result.current.handleScroll(
        {
          currentTarget: {
            scrollTop: 10,
            clientHeight: 10,
            scrollHeight: 100,
          },
        } as React.UIEvent<HTMLDivElement>,
        'ins-1'
      );
    });

    expect(mockFetchSearch).not.toHaveBeenCalled();
  });

  it('toggleDescription fetches premium detail once and toggles expansion', async () => {
    const { result } = renderController();

    await act(async () => {
      result.current.toggleDescription('Plan A');
    });

    await waitFor(() => {
      expect(result.current.expandedDescriptionPremiumId).toBe('id-Plan A');
      expect(result.current.premiumDetailsById['id-Plan A']).toBeDefined();
    });

    await act(async () => {
      result.current.toggleDescription('Plan A');
    });

    expect(result.current.expandedDescriptionPremiumId).toBeNull();
    expect(mockFetchPremiumDetail).toHaveBeenCalledTimes(1);
  });

  it('handlePaymentClick exits when premium detail has no product', async () => {
    mockFetchPremiumDetail.mockResolvedValueOnce({ data: {} });

    const { result } = renderController();

    await act(async () => {
      await result.current.handlePaymentClick(
        { name: 'Plan B' } as any,
        'ins-1'
      );
    });

    expect(mockHandleOpenPackage).not.toHaveBeenCalled();
  });

  it('handlePaymentClick transforms and opens package with insurer display name', async () => {
    mockFetchPremiumDetail.mockResolvedValueOnce({
      data: {
        product: {
          insuranceCategory: 'mandatory',
          coverages: [
            {
              coverageType: 'termAndConditionEN',
              textValue: 'Specific EN T&C',
            },
          ],
        },
      },
    });

    const { result } = renderController();

    await act(async () => {
      await result.current.handlePaymentClick(
        { name: 'Plan C' } as any,
        'ins-1'
      );
    });

    expect(premiumDetailProductToPremiumToPackage).toHaveBeenCalled();
    expect(mockHandleOpenPackage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Alpha Insurance',
        subtitle: 'packageListing.values.insuranceType.mandatory',
        repairType: 'packageListing.values.repairType.Dealer',
      })
    );
  });

  it('handlePaymentClick maps garage repair type and non-mandatory subtitle', async () => {
    helperModule.getPremiumAttrs.mockReturnValueOnce({
      insuranceType: 'Type 2',
      repairType: 'garage',
      submodel: 'Premium',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    });
    (premiumDetailProductToPremiumToPackage as jest.Mock).mockReturnValueOnce({
      insuranceType: 'Type 2',
      repairType: 'garage',
      insuranceCategory: 'voluntary',
      insuranceCompany: {},
    });

    const { result } = renderController();

    await act(async () => {
      await result.current.handlePaymentClick(
        { name: 'Plan D' } as any,
        'ins-1'
      );
    });

    expect(mockHandleOpenPackage).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'packageListing.values.insuranceType.type2',
        repairType: 'packageListing.values.repairType.Garage',
      })
    );
  });

  it('handlePaymentClick uses toPackage insuranceType and leaves repairType undefined when unknown', async () => {
    helperModule.getPremiumAttrs.mockReturnValueOnce({
      insuranceType: '',
      repairType: '',
      submodel: 'Premium',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    });
    (premiumDetailProductToPremiumToPackage as jest.Mock).mockReturnValueOnce({
      insuranceType: 'Comprehensive',
      repairType: '',
      insuranceCategory: 'voluntary',
      insuranceCompany: {},
    });

    const { result } = renderController();

    await act(async () => {
      await result.current.handlePaymentClick(
        { name: 'Plan E' } as any,
        'ins-1'
      );
    });

    expect(mockHandleOpenPackage).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'packageListing.values.insuranceType.comprehensive',
        repairType: undefined,
      })
    );
  });

  it('handleQuotation navigates to package detail url', () => {
    const { result } = renderController();

    act(() => {
      result.current.handleQuotation('pkg-1');
    });

    expect(getPackageDetailUrl).toHaveBeenCalledWith({
      leadId: 'lead-1',
      packageId: 'pkg-1',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lead-1/package/pkg-1');
  });

  it('handleSubModelChange stores sub model and reopens insurer with new query', async () => {
    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      await result.current.toggleInsurer('ins-1');
    });

    mockFetchSearch.mockClear();

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'GR Sport');
    });

    await waitFor(() => expect(mockFetchSearch).toHaveBeenCalledTimes(1));
    expect(result.current.selectedSubModelByInsurer['ins-1']).toBe('GR Sport');
    expect(buildSearchRequest).toHaveBeenLastCalledWith(
      baseCriteria,
      expect.objectContaining({ insurerId: 'ins-1' })
    );
  });

  it('filters premiums when selected value exactly matches the premium submodel', async () => {
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'GR Sport Turbo' : 'Sedan',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: 'n2',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'GR Sport Turbo');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P1' },
      ])
    );
  });

  it('includes premium when selected value is longer and contains the premium submodel as a substring', async () => {
    // selected = "GR Sport Turbo 2024", premium submodel = "GR Sport Turbo"
    // "gr sport turbo 2024".includes("gr sport turbo") → true → should match
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'GR Sport Turbo' : 'Standard',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: '',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'GR Sport Turbo 2024');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P1' },
      ])
    );
  });

  it('excludes premium when the premium submodel is longer than the selected value (reverse substring direction)', async () => {
    // selected = "GR Sport", premium submodel = "GR Sport Turbo"
    // "gr sport".includes("gr sport turbo") → false → should NOT match
    // premium submodel = "GR Sport" → "gr sport".includes("gr sport") = true → should match
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'GR Sport Turbo' : 'GR Sport',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: '',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'GR Sport');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P2' },
      ])
    );
  });

  it('submodel filter matching is case-insensitive', async () => {
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'GR SPORT TURBO' : 'Sedan',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: '',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'gr sport turbo');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P1' },
      ])
    );
  });

  it('matches premium when submodel contains the model text as a prefix (e.g., model "Yaris" + submodel "Yaris RS")', async () => {
    // selected = "Yaris RS", premium submodel = "Yaris RS"
    // After stripping criteriaModel "Yaris": normalizedSelected = "rs", normalizedPremium = "rs" → match
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'Yaris RS' : 'Sedan',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: '',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'Yaris RS');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P1' },
      ])
    );
  });

  it('excludes premium when model text stripped submodel does not match selected', async () => {
    // selected = "Yaris RS" → after stripping "Yaris" → "rs"
    // premium submodel = "Yaris GR" → after stripping "Yaris" → "gr" → no match
    helperModule.getPremiumAttrs.mockImplementation((premium: any) => ({
      insuranceType: 'Type 1 Mandatory',
      repairType: 'Authorized Dealer',
      submodel: premium.name === 'P1' ? 'Yaris GR' : 'Yaris RS',
      maximumAnnualCoverage: '250000',
      deductible: '1000',
    }));
    mockFetchSearch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        premiums: [{ name: 'P1' }, { name: 'P2' }],
        nextToken: '',
      }),
    });

    const { result } = renderController({ aggregationCriteria: baseCriteria });

    await act(async () => {
      result.current.handleSubModelChange('ins-1', 'Yaris RS');
    });

    await waitFor(() =>
      expect(result.current.searchResultsByInsurer['ins-1']).toEqual([
        { name: 'P2' },
      ])
    );
  });
});
