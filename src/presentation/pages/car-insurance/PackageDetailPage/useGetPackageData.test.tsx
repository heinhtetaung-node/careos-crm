// @ts-nocheck
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import useGetPackageData, {
  saveFilterValuesToStorage,
  getFilterValueFromStorage,
  removeFilterValueFromStorage,
} from './useGetPackageData';

import { useParams } from 'react-router-dom';
import { useGetPackagesQuery } from 'data/slices/packageListing';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import {
  useGetLeadSelector,
  useGetProductSelector,
} from 'presentation/redux/selectors/lead';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import SessionStorage from 'shared/helper/SessionStorage';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import transformPackages from 'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation';

// ------------------------
// Mocks
// ------------------------

const setItemByKeyMock = jest.fn();
const getItemByKeyMock = jest.fn();
const removeItemByKeyMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('data/slices/packageListing', () => ({
  useGetPackagesQuery: jest.fn(),
}));

jest.mock('data/slices/packageListing/api', () => ({
  useGetSelectedPackageQuery: jest.fn(),
}));

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(),
  useGetProductSelector: jest.fn(),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('shared/helper/SessionStorage', () =>
  jest.fn().mockImplementation(() => ({
    setItemByKey: setItemByKeyMock,
    getItemByKey: getItemByKeyMock,
    removeItemByKey: removeItemByKeyMock,
  }))
);

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn(),
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation',
  () => jest.fn()
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/packageFilter.helper',
  () => ({
    defaultFiltervalue: {
      insuranceCategory: 'both',
    },
  })
);

jest.mock('config/TypeFilter', () => ({
  PRODUCTS: {
    HEALTH_PRODUCT_INSURANCE: 'health-product',
    CAR_PRODUCT_INSURANCE: 'car-product',
  },
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseGetPackagesQuery = useGetPackagesQuery as jest.MockedFunction<
  typeof useGetPackagesQuery
>;
const mockUseGetSelectedPackageQuery =
  useGetSelectedPackageQuery as jest.MockedFunction<
    typeof useGetSelectedPackageQuery
  >;
const mockUseGetLeadSelector = useGetLeadSelector as jest.MockedFunction<
  typeof useGetLeadSelector
>;
const mockUseGetProductSelector = useGetProductSelector as jest.MockedFunction<
  typeof useGetProductSelector
>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;
const mockGetLeadIdFromPath = getLeadIdFromPath as jest.MockedFunction<
  typeof getLeadIdFromPath
>;
const mockTransformPackages = transformPackages as jest.MockedFunction<
  typeof transformPackages
>;

describe('useGetPackageData helpers (storage + source label)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLeadIdFromPath.mockReturnValue('lead-123');
  });

  it('saveFilterValuesToStorage stores filter keyed by lead id', () => {
    const filter = { insuranceKind: 'both', paymentOption: 'FULL_PAYMENT' };

    saveFilterValuesToStorage(filter as any);

    expect(SessionStorage).toHaveBeenCalledTimes(1);
    expect(setItemByKeyMock).toHaveBeenCalledWith(
      'PACKAGE_FILTER-lead-123',
      JSON.stringify(filter)
    );
  });

  it('getFilterValueFromStorage returns parsed filter when JSON is valid', () => {
    const storedFilter = { insuranceKind: 'mandatory' };
    getItemByKeyMock.mockReturnValueOnce(JSON.stringify(storedFilter));

    const result = getFilterValueFromStorage();

    expect(SessionStorage).toHaveBeenCalledTimes(1);
    expect(getItemByKeyMock).toHaveBeenCalledWith('PACKAGE_FILTER-lead-123');
    expect(result).toEqual(storedFilter);
  });

  it('getFilterValueFromStorage returns undefined when JSON is invalid', () => {
    getItemByKeyMock.mockReturnValueOnce('not-json');

    const result = getFilterValueFromStorage();

    expect(result).toBeUndefined();
  });

  it('removeFilterValueFromStorage clears storage for current lead', () => {
    removeFilterValueFromStorage();

    expect(SessionStorage).toHaveBeenCalledTimes(1);
    expect(removeItemByKeyMock).toHaveBeenCalledWith('PACKAGE_FILTER-lead-123');
  });
});

describe('useGetPackageData hook', () => {
  const baseFilterValues = {
    insuranceKind: 'both',
    paymentOption: 'FULL_PAYMENT',
    installment: 1,
    sumInsured: {
      min: '100000',
      max: '200000',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ id: 'lead-123' } as any);
    mockUseGetProductSelector.mockReturnValue('products/car-insurance' as any);
    mockUseGetLeadSelector.mockReturnValue({
      data: { insuranceKind: 'both' },
    } as any);
    mockUseAppSelector.mockReturnValue('car-product' as any);

    mockUseGetPackagesQuery.mockReturnValue({
      data: {
        packages: [],
        carDetails: { source: 'packagesQuery' },
      },
      isLoading: false,
    } as any);

    mockUseGetSelectedPackageQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    mockTransformPackages.mockReset();
  });

  it('returns transformed selected package data when packageIds is empty (car product)', () => {
    const selectedPackageResponse = {
      carPackageWithPricing: {
        package: { id: 'p1', name: 'Package 1' },
        sumInsuredMin: 1000000,
        sumInsuredMax: 2000000,
        carDetails: { from: 'selectedPackage' },
      },
    };

    mockUseGetSelectedPackageQuery.mockReturnValueOnce({
      data: selectedPackageResponse,
      isLoading: false,
    } as any);

    mockTransformPackages.mockReturnValueOnce([
      {
        id: '1',
        name: 'pkg1',
        customQuoteDetails: {
          priceDetail: { resourceName: 'packages/abc' },
        },
      },
      {
        id: '2',
        name: 'pkg2',
        customQuoteDetails: {
          priceDetail: { resourceName: 'premiums/def' },
        },
      },
      {
        id: '3',
        name: 'pkg3',
        customQuoteDetails: {
          priceDetail: { resourceName: 'renewalPackages/ghi' },
        },
      },
      {
        id: '4',
        name: 'pkg4',
        customQuoteDetails: {
          priceDetail: { resourceName: 'other/jkl' },
        },
      },
    ] as any);

    const { result } = renderHook(() =>
      useGetPackageData([], baseFilterValues as any)
    );

    const { packages, sumInsuredInfo, isLoading, carDetails } = result.current;

    // transformPackages should be called with selected package and default filter values merged
    expect(mockTransformPackages).toHaveBeenCalledTimes(1);
    const [, filterArg] = mockTransformPackages.mock.calls[0];
    expect(filterArg.insuranceCategory).toBe('both');

    expect(packages).toHaveLength(4);
    expect(packages.map((p: any) => p.packageSource)).toEqual([
      'manual',
      'default',
      'renewal_manual_quote',
      'default',
    ]);

    expect(sumInsuredInfo).toEqual({
      min: 1000000 / 100,
      max: 2000000 / 100,
    });
    expect(isLoading).toBe(false);
    // carDetails prefers data from useGetPackagesQuery when available
    expect(carDetails).toEqual({ source: 'packagesQuery' });
  });

  it('returns transformed filtered packages when packageIds are provided', () => {
    const filterValues = {
      insuranceKind: 'VOLUNTARY',
    } as any;

    mockUseGetPackagesQuery.mockReturnValueOnce({
      data: {
        packages: [
          { name: 'pkg-1', other: 'x' },
          { name: 'pkg-2', other: 'y' },
          { name: 'pkg-3', other: 'z' },
        ],
      },
      isLoading: false,
    } as any);

    mockTransformPackages.mockReturnValueOnce([
      { id: 'pkg-1' },
      { id: 'pkg-2' },
    ] as any);

    const { result } = renderHook(() =>
      useGetPackageData(['pkg-1', 'pkg-2'], filterValues)
    );

    const { packages } = result.current;

    expect(mockTransformPackages).toHaveBeenCalledTimes(1);
    const [filteredArg, filterArg] = mockTransformPackages.mock.calls[0];
    expect(filteredArg).toHaveLength(2);
    expect(filteredArg.map((p: any) => p.name)).toEqual(['pkg-1', 'pkg-2']);
    expect(filterArg.insuranceCategory).toBe('VOLUNTARY');

    expect(packages).toEqual([{ id: 'pkg-1' }, { id: 'pkg-2' }]);
  });

  it('returns empty packages for health product and uses health package fields', () => {
    mockUseAppSelector.mockReturnValueOnce('health-product' as any);

    const selectedHealthResponse = {
      healthPackage: {
        package: { id: 'hp1', name: 'Health Package' },
        sumInsuredMin: 500000,
        sumInsuredMax: 600000,
        carDetails: { from: 'health-selected' },
      },
    };

    mockUseGetSelectedPackageQuery.mockReturnValueOnce({
      data: selectedHealthResponse,
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useGetPackageData([], baseFilterValues as any)
    );

    const { packages, sumInsuredInfo } = result.current;

    // For health product, we should not transform into car packages
    expect(packages).toEqual([]);
    expect(sumInsuredInfo).toEqual({
      min: 500000 / 100,
      max: 600000 / 100,
    });
    expect(mockTransformPackages).not.toHaveBeenCalled();
  });
});
