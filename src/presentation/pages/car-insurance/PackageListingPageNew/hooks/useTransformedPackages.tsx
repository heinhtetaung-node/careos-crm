import sortAndFilter from '@careos/sorting-filtering';
import _get from 'lodash/get';
import { useDispatch } from 'react-redux';

import { useLazyGetPackagesQuery } from 'data/slices/packageListing';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetProductSelector } from 'presentation/redux/selectors/lead';
import { getLanguage } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { generateErrorMessage } from 'shared/helper/ErrorHelper';
import { formatBahtToSatang } from 'utils/currency';

import { FilterInterface } from '../PackageFilter/interface';
import transformPackages from '../packageTransformation';
import { useCallback, useEffect, useMemo } from 'react';

export type TransformedPackageType = ReturnType<
  typeof transformPackages
>[number];

export const otherPackageSources = ['import', 'renewal_manual_quote', 'manual'];

const sortKeyMap: Record<string, string> = {
  insurer: 'title',
  package_name: 'displayName',
  insurer_type: 'carInsuranceType',
  repair_type: 'repairType',
  car_coverage: 'sumCoverage',
  deductible: 'deductibleAmount',
  price: 'price',
  paymentPlan: 'paymentPlan',
  shippingFee: 'shippingFee',
  discount: 'priceSummary.discountAmount',
  processingFee: 'processingFee',
  premium: 'invoicePrice',
};

const parseNumber = (value: string | unknown): number | null => {
  if (typeof value === 'string') {
    const numericValue = parseFloat(value.replace(/,/g, ''));
    return Number.isNaN(numericValue) ? null : numericValue;
  }
  if (typeof value === 'number') return value;
  return null;
};

const toSortableString = (value: unknown) => {
  if (value == null) return '';
  if (['string', 'number', 'boolean', 'bigint'].includes(typeof value)) {
    return String(value);
  }
  return '';
};

export const handleSortData = (
  data: any[],
  sortByKey: string,
  order: 'asc' | 'desc' = 'asc'
) => {
  const field = sortKeyMap[sortByKey];

  if (!field) return data;

  const getFieldValue = (obj: unknown, _field: string): unknown =>
    _field
      .split('.')
      .reduce(
        (acc: unknown, key: string) => (acc as Record<string, unknown>)?.[key],
        obj
      ) ?? '';

  const compareValues = (a: unknown, b: unknown) => {
    const valueA = getFieldValue(a, field);
    const valueB = getFieldValue(b, field);

    const numA = parseNumber(valueA);
    const numB = parseNumber(valueB);

    if (numA !== null && numB !== null) {
      return order === 'asc' ? numA - numB : numB - numA;
    }

    const stringA = toSortableString(valueA);
    const stringB = toSortableString(valueB);
    return order === 'asc'
      ? stringA.localeCompare(stringB)
      : stringB.localeCompare(stringA);
  };

  return [...data].sort((a, b) => compareValues(a, b));
};

const sumInsuredMinMaxFilter = (filterValues: FilterInterface) =>
  !filterValues.isDefaultSumInsured && {
    sumInsuredMin: formatBahtToSatang(filterValues.sumInsured?.min),
    sumInsuredMax: formatBahtToSatang(filterValues.sumInsured?.max),
  };

export const queryStringFilter = (filterData: Partial<FilterInterface>) => ({
  ...(filterData.year ? { year: filterData.year } : {}),
  ...(filterData.model ? { model: filterData.model } : {}),
  ...(filterData.brand ? { brand: filterData.brand } : {}),
  ...(filterData.carSubModelYear
    ? { carSubModelYear: filterData.carSubModelYear }
    : {}),
  ...(filterData.province ? { province: filterData.province } : {}),
  ...(filterData.drivingPurpose
    ? { drivingPurpose: filterData.drivingPurpose }
    : {}),
  ...(filterData.dashCam === undefined
    ? {}
    : {
        hasCarDashcam: filterData.dashCam,
      }),
  ...(filterData.modification === undefined
    ? {}
    : {
        modification: filterData.modification,
      }),
  ...(filterData.noOfDoors ? { doors: filterData.noOfDoors } : {}),
  ...(filterData.engineSize ? { engineSize: filterData.engineSize } : {}),
  ...(Object.keys(filterData).length > 0 ? { newSearch: true } : {}),
});

function useTransformedPackages(
  leadId: string,
  filterValues: FilterInterface,
  isNew: boolean = false,
  filterData: Partial<FilterInterface> = {}
) {
  const currentLanguage = getLanguage();

  const currencyConvertedFilterValues = {
    ...filterValues,
    ...(filterValues.price
      ? {
          price: {
            min: BigInt(filterValues.price.min) * BigInt(100),
            max: BigInt(filterValues.price.max) * BigInt(100),
          },
        }
      : {}),
    ...(filterValues.sumInsured
      ? {
          sumInsured: {
            min: BigInt(filterValues.sumInsured.min) * BigInt(100),
            max: BigInt(filterValues.sumInsured.max) * BigInt(100),
          },
        }
      : {}),
  };
  const dispatch = useDispatch();
  const product = useGetProductSelector();
  const {
    brand,
    carSubModelYear,
    dashCam,
    drivingPurpose,
    engineSize,
    model,
    modification,
    noOfDoors,
    province,
    year,
  } = filterData;
  const queryParams = useMemo(
    () => ({
      productType: product,
      leadId,
      insuranceKind: filterValues.insuranceCategory,
      ...sumInsuredMinMaxFilter(filterValues),
      ...(isNew ? queryStringFilter(filterData) : null),
    }),
    [
      brand,
      carSubModelYear,
      dashCam,
      drivingPurpose,
      engineSize,
      filterValues.insuranceCategory,
      filterValues.isDefaultSumInsured,
      filterValues.sumInsured?.max,
      filterValues.sumInsured?.min,
      isNew,
      leadId,
      model,
      modification,
      noOfDoors,
      product,
      province,
      year,
    ]
  );

  const [getPackages, { data, isLoading, error, isFetching, isUninitialized }] =
    useLazyGetPackagesQuery();

  useEffect(() => {
    if (
      queryParams?.brand &&
      queryParams?.model &&
      (queryParams?.carSubModelYear || queryParams?.year)
    ) {
      getPackages(queryParams);
    }
  }, [queryParams, getPackages]);

  useEffect(() => {
    if (error) {
      const errorResponse: unknown = _get(error, 'data.details');
      const errorArray =
        Array.isArray(errorResponse) && errorResponse.length > 0
          ? errorResponse.map((response) =>
              generateErrorMessage(
                response as Parameters<typeof generateErrorMessage>[0]
              )
            )
          : _get(error, 'data.message');

      dispatch(
        showSnackBar({
          isOpen: true,
          message: Array.isArray(errorArray)
            ? errorArray.join('. ')
            : String(errorArray ?? ''),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  }, [error]);

  const { normalPackages, customPackages } = sortAndFilter(
    'motor',
    (data?.packages.map((pkg) => ({ ...pkg, deduct: pkg.deductibleAmount })) ??
      []) as any,
    currencyConvertedFilterValues as any,
    isNew,
    false,
    currentLanguage as any
  );

  const getTransformedCustomPackages = () => {
    const transformedCustomPackages = transformPackages(
      customPackages as any,
      filterValues
    );
    if (isNew) {
      return handleSortData(
        transformedCustomPackages,
        filterValues.sortBy,
        filterValues.orderBy
      );
    }
    return transformedCustomPackages;
  };

  const getTransformedNormalPackages = () => {
    const transformedNormalPackages = transformPackages(
      normalPackages,
      filterValues
    );

    if (isNew) {
      return handleSortData(
        transformedNormalPackages,
        filterValues.sortBy,
        filterValues.orderBy
      );
    }
    return transformedNormalPackages;
  };

  const _normalPackages = useMemo(
    () => getTransformedNormalPackages(),
    [filterValues, isNew, normalPackages]
  );

  const _customPackages = useMemo(
    () => getTransformedCustomPackages(),
    [filterValues, isNew, customPackages]
  );

  return {
    normalPackages: _normalPackages,
    customPackages: _customPackages,
    manualRenewalImportPackages: _customPackages.filter((pkg: any) =>
      otherPackageSources.includes(pkg.packageSource)
    ),
    rawPackages: data?.packages ?? [],
    carDetails: data?.carDetails ?? {},
    status: {
      isLoading,
      isFetching,
    },
    refetch: useCallback(() => {
      if (isUninitialized) {
        return Promise.resolve(undefined);
      }
      return getPackages(queryParams);
    }, [getPackages, isUninitialized, queryParams]),
  };
}

export default useTransformedPackages;
