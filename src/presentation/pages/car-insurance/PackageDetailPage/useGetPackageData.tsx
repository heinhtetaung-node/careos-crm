import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetPackagesQuery } from 'data/slices/packageListing';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import {
  useGetLeadSelector,
  useGetProductSelector,
} from 'presentation/redux/selectors/lead';
import SessionStorage from 'shared/helper/SessionStorage';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import { Package, PackageSource } from 'shared/types/packages';

import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { FilterInterface } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/interface';
import { defaultFiltervalue } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/packageFilter.helper';
import transformPackages from 'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

const FILTER_VALUE_STORAGE_KEY = 'PACKAGE_FILTER';

export const saveFilterValuesToStorage = (filter: FilterInterface) => {
  const leadId = getLeadIdFromPath();
  const storage = new SessionStorage();
  storage.setItemByKey(
    `${FILTER_VALUE_STORAGE_KEY}-${leadId}`,
    JSON.stringify(filter)
  );
};

export const getFilterValueFromStorage = () => {
  const leadId = getLeadIdFromPath();
  const storage = new SessionStorage();

  try {
    return JSON.parse(
      storage.getItemByKey(`${FILTER_VALUE_STORAGE_KEY}-${leadId}`)
    ) as FilterInterface;
  } catch {
    return undefined;
  }
};

export const removeFilterValueFromStorage = () => {
  const leadId = getLeadIdFromPath();
  const storage = new SessionStorage();
  storage.removeItemByKey(`${FILTER_VALUE_STORAGE_KEY}-${leadId}`);
};

interface FilterValues {
  paymentOption?: string;
  paymentMethod?: string;
  installment?: number | undefined;
  insuranceKind: string;
  sumInsured?: {
    min: string;
    max: string;
  };
  otherParams?: any;
}

const getPackageSourceLabel = (resourceName?: string): PackageSource => {
  const sourcePrefix = resourceName?.split('/')?.[0];

  switch (sourcePrefix) {
    case 'packages':
      return 'manual';
    case 'premiums':
      return 'default';
    case 'renewalPackages':
      return 'renewal_manual_quote';
    default:
      return 'default';
  }
};

function useGetPackageData(
  packageIds: string[],
  filterValues: FilterValues,
  skip?: boolean
) {
  const { id: leadId } = useParams<{ id: string }>();
  const product = useGetProductSelector();
  const lead = useGetLeadSelector();

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { data, isLoading } = useGetPackagesQuery(
    {
      productType: product,
      leadId: leadId!,
      sumInsuredMin: filterValues?.sumInsured?.min,
      sumInsuredMax: filterValues?.sumInsured?.max,
      paymentOption: filterValues?.paymentOption ?? 'FULL_PAYMENT',
      installment: filterValues?.installment ?? 1,
      ...filterValues?.otherParams,
    },
    {
      skip: skip || packageIds.length === 0,
    }
  );

  const { data: selectedPackage, isLoading: isSelectedPackageLoading } =
    useGetSelectedPackageQuery(
      { leadId: leadId!, enableDiscountPricing: true },
      {
        skip: skip || packageIds.length !== 0,
      }
    );

  const isHealthProduct = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const selectedPackageData = useMemo(() => {
    if (isHealthProduct) {
      return (selectedPackage as any)?.healthPackage ?? {};
    }
    return selectedPackage?.carPackageWithPricing ?? {};
  }, [isHealthProduct, selectedPackage]);

  const packages: TransformedPackageType[] = useMemo(() => {
    if (isHealthProduct) return [];

    // Case 1: No packageIds → selected package flow
    if (packageIds.length === 0) {
      const selected = selectedPackageData?.package
        ? [selectedPackageData.package as Package]
        : [];

      if (selected.length === 0) return [];

      const transformed = transformPackages(selected, {
        ...defaultFiltervalue,
        insuranceCategory: lead.data?.insuranceKind ?? 'both',
      });

      return transformed.map((pkg) => ({
        ...pkg,
        packageSource: getPackageSourceLabel(
          pkg.customQuoteDetails?.priceDetail?.resourceName
        ),
      }));
    }

    // Case 2: Filter by packageIds → compare packages / view detail package (premium / manual / renewal)
    const packageIdSet = new Set(packageIds);

    const filteredPackages = (data?.packages ?? []).filter((pkg) =>
      packageIdSet.has(pkg.name)
    );

    return filterValues
      ? transformPackages(filteredPackages, {
          insuranceCategory: filterValues.insuranceKind,
        } as FilterInterface)
      : [];
  }, [
    isHealthProduct,
    packageIds,
    selectedPackageData,
    data?.packages,
    filterValues,
    lead.data?.insuranceKind,
  ]);

  return {
    packages,
    sumInsuredInfo: {
      min: (selectedPackageData?.sumInsuredMin ?? 0) / 100,
      max: (selectedPackageData?.sumInsuredMax ?? 0) / 100,
    },
    isLoading: isLoading || isSelectedPackageLoading,
    carDetails: data?.carDetails || selectedPackageData?.carDetails,
  };
}

export default useGetPackageData;
