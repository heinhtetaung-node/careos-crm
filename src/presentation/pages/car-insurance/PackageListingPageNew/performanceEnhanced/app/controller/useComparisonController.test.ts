import { renderHook, act, waitFor } from '@testing-library/react';
import { useComparisonController } from './useComparisonController';
import * as packageListing from 'data/slices/packageListing';
import transformPackageFromGenericToNormal from 'presentation/pages/car-insurance/PackageDetailPage/transformPackageFromGenericToNormal';

const mockDispatch = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('data/slices/packageListing', () => ({
  addToComparison: jest.fn((payload) => ({
    type: 'addToComparison',
    payload,
  })),
  removeFromComparison: jest.fn((id) => ({
    type: 'removeFromComparison',
    payload: id,
  })),
}));

const mockGetGenericPackageDetail = jest.fn();
jest.mock('data/slices/genericPackageSlice', () => ({
  useLazyGetGenericPackageDetailQuery: () => [mockGetGenericPackageDetail],
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/hooks/usePackageStorage',
  () => ({
    __esModule: true,
    default: () => ({ packageData: [] }),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation',
  () => ({
    __esModule: true,
    default: jest.fn((pkgs) => pkgs),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageDetailPage/transformPackageFromGenericToNormal',
  () => ({
    __esModule: true,
    default: jest.fn((data) => data ?? { name: 'transformed' }),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    ...jest.requireActual(
      'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper'
    ),
  })
);

jest.mock('data/slices/packageListing/helper', () => ({
  getMaximumPackageLimit: jest.fn().mockReturnValue(2),
}));

describe('useComparisonController', () => {
  const defaultArgs = {
    currentData: { yearValue: 2024, insuranceKind: 'voluntary' },
    rawPackages: [],
    filterValues: {},
    packagesForComparison: [],
  };

  /** Initial `packagesForComparison` for rerender tests (empty). @type {string[]} */
  const emptyPackageIds = [];

  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetGenericPackageDetail.mockReset();
    mockGetGenericPackageDetail.mockResolvedValue({ data: { name: 'pkg-1' } });
    jest
      .mocked(transformPackageFromGenericToNormal)
      .mockImplementation((data) => data ?? { name: 'transformed' });
  });

  it('returns addForComparison, removeFromComparison, and compareBarProps', () => {
    const { result } = renderHook(() => useComparisonController(defaultArgs));

    expect(result.current).toHaveProperty('addForComparison');
    expect(result.current).toHaveProperty('removeFromComparison');
    expect(result.current).toHaveProperty('compareBarProps');
    expect(typeof result.current.addForComparison).toBe('function');
    expect(typeof result.current.removeFromComparison).toBe('function');
    expect(result.current.compareBarProps).toMatchObject({
      packages: expect.any(Array),
      filterValues: {},
      removePackage: expect.any(Function),
    });
  });

  describe('addForComparison with premiums/ id (generic detail)', () => {
    it('fetches detail, transforms, dispatches, and appends compared package when under max', async () => {
      const premiumId = 'premiums/under-max';
      const apiPayload = { name: premiumId, detail: true };
      jest
        .mocked(transformPackageFromGenericToNormal)
        .mockReturnValueOnce(apiPayload);
      mockGetGenericPackageDetail.mockResolvedValue({
        data: { rawFromApi: true },
      });

      const { result, rerender } = renderHook(
        ({ ids }) =>
          useComparisonController({
            ...defaultArgs,
            packagesForComparison: ids,
          }),
        { initialProps: { ids: emptyPackageIds } }
      );

      await act(async () => {
        await result.current.addForComparison(premiumId);
      });

      expect(mockGetGenericPackageDetail).toHaveBeenCalledWith({
        id: premiumId,
        carSubModelYear: 2024,
        insuranceKind: 'VOLUNTARY',
      });
      expect(transformPackageFromGenericToNormal).toHaveBeenCalledWith({
        rawFromApi: true,
      });
      expect(packageListing.addToComparison).toHaveBeenCalledWith({
        id: premiumId,
        maxLimit: expect.any(Number),
      });
      expect(mockDispatch).toHaveBeenCalled();

      rerender({ ids: [premiumId] });
      await waitFor(() => {
        expect(result.current.compareBarProps.packages).toContainEqual(
          expect.objectContaining({ name: premiumId })
        );
      });
    });

    it('fetches detail and uses capacity slice when packagesForComparison is already at max', async () => {
      const premiumId = 'premiums/at-capacity';
      const apiPayload = { name: premiumId };
      jest
        .mocked(transformPackageFromGenericToNormal)
        .mockReturnValueOnce(apiPayload);
      mockGetGenericPackageDetail.mockResolvedValue({
        data: { name: premiumId },
      });

      const threeNonPremiumIds = ['packages/a', 'packages/b', 'packages/c'];
      const { result, rerender } = renderHook(
        ({ ids }) =>
          useComparisonController({
            ...defaultArgs,
            packagesForComparison: ids,
          }),
        { initialProps: { ids: threeNonPremiumIds } }
      );

      await act(async () => {
        await result.current.addForComparison(premiumId);
      });

      expect(mockGetGenericPackageDetail).toHaveBeenCalledWith({
        id: premiumId,
        carSubModelYear: 2024,
        insuranceKind: 'VOLUNTARY',
      });
      expect(packageListing.addToComparison).toHaveBeenCalledWith({
        id: premiumId,
        maxLimit: expect.any(Number),
      });

      rerender({ ids: [...threeNonPremiumIds, premiumId] });
      await waitFor(() => {
        expect(result.current.compareBarProps.packages).toContainEqual(
          expect.objectContaining({ name: premiumId })
        );
      });
    });
  });

  it('addForComparison with non-premium id dispatches addToComparison', async () => {
    const { result } = renderHook(() => useComparisonController(defaultArgs));

    await act(async () => {
      result.current.addForComparison('packages/some-id');
    });

    const { addToComparison } = packageListing;
    expect(addToComparison).toHaveBeenCalledWith({
      id: 'packages/some-id',
      maxLimit: expect.any(Number),
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('addForComparison does not dispatch when id is already in comparison', async () => {
    const { result } = renderHook(() =>
      useComparisonController({
        ...defaultArgs,
        packagesForComparison: ['packages/some-id'],
      })
    );

    await act(async () => {
      result.current.addForComparison('packages/some-id');
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('removeFromComparison dispatches removeFromComparison action', () => {
    const { result } = renderHook(() =>
      useComparisonController({
        ...defaultArgs,
        packagesForComparison: ['pkg-1'],
      })
    );

    act(() => {
      result.current.removeFromComparison('pkg-1');
    });

    const { removeFromComparison } = packageListing;
    expect(removeFromComparison).toHaveBeenCalledWith('pkg-1');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('compareBarProps.removePackage removes from comparison', () => {
    const { result } = renderHook(() => useComparisonController(defaultArgs));

    act(() => {
      result.current.compareBarProps.removePackage('some-id');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  describe('preparePackagesForComparison (effect when packagesForComparison has premium ids)', () => {
    it('calls getGenericPackageDetail for each premiums/ id with year and insuranceKind', async () => {
      const args = {
        ...defaultArgs,
        currentData: { yearValue: 2024, insuranceKind: 'voluntary' },
        packagesForComparison: ['premiums/id1', 'premiums/id2'],
      };
      mockGetGenericPackageDetail
        .mockResolvedValueOnce({ data: { name: 'pkg-1' } })
        .mockResolvedValueOnce({ data: { name: 'pkg-2' } });

      renderHook(() => useComparisonController(args));

      await waitFor(() => {
        expect(mockGetGenericPackageDetail).toHaveBeenCalledWith({
          id: 'premiums/id1',
          carSubModelYear: 2024,
          insuranceKind: 'VOLUNTARY',
        });
        expect(mockGetGenericPackageDetail).toHaveBeenCalledWith({
          id: 'premiums/id2',
          carSubModelYear: 2024,
          insuranceKind: 'VOLUNTARY',
        });
      });

      expect(transformPackageFromGenericToNormal).toHaveBeenCalledWith({
        name: 'pkg-1',
      });
      expect(transformPackageFromGenericToNormal).toHaveBeenCalledWith({
        name: 'pkg-2',
      });
    });

    it('sets comparedPackages so compareBarProps.packages reflect transformed results', async () => {
      const args = {
        ...defaultArgs,
        currentData: { yearValue: 2024, insuranceKind: 'voluntary' },
        packagesForComparison: ['premiums/one'],
      };
      mockGetGenericPackageDetail.mockResolvedValue({
        data: { name: 'premiums/one' },
      });

      const { result } = renderHook(() => useComparisonController(args));

      await waitFor(() => {
        expect(result.current.compareBarProps.packages.length).toBeGreaterThan(
          0
        );
      });

      expect(result.current.compareBarProps.packages).toContainEqual(
        expect.objectContaining({ name: 'premiums/one' })
      );
    });

    it('does not call getGenericPackageDetail when packagesForComparison has no premiums/ ids', async () => {
      const args = {
        ...defaultArgs,
        currentData: { yearValue: 2024, insuranceKind: 'voluntary' },
        packagesForComparison: ['packages/only', 'other/id'],
      };

      renderHook(() => useComparisonController(args));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockGetGenericPackageDetail).not.toHaveBeenCalled();
    });

    it('passes carSubModelYear and insuranceKind from currentData to getGenericPackageDetail', async () => {
      const args = {
        ...defaultArgs,
        currentData: { yearValue: 2023, insuranceKind: 'mandatory' },
        packagesForComparison: ['premiums/id1'],
      };
      mockGetGenericPackageDetail.mockResolvedValue({ data: { name: 'x' } });

      renderHook(() => useComparisonController(args));

      await waitFor(() => {
        expect(mockGetGenericPackageDetail).toHaveBeenCalledWith({
          id: 'premiums/id1',
          carSubModelYear: 2023,
          insuranceKind: 'MANDATORY',
        });
      });
    });

    it('handles getGenericPackageDetail rejection without throwing', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const args = {
        ...defaultArgs,
        currentData: { yearValue: 2024, insuranceKind: 'voluntary' },
        packagesForComparison: ['premiums/fail'],
      };
      mockGetGenericPackageDetail.mockRejectedValue(new Error('api error'));

      renderHook(() => useComparisonController(args));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
