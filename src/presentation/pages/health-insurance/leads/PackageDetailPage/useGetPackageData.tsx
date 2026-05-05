import { useParams } from 'react-router-dom';

import { useGetPackagesQuery } from 'data/slices/packageListing';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import { useGetProductSelector } from 'presentation/redux/selectors/lead';
import { Package } from 'shared/types/packages';

import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import Transformer from './health/transformer';
import { getLanguage, LANGUAGES } from 'presentation/theme/localization';

interface FilterValues {
  paymentOption?: string;
  paymentMethod?: string;
  installment?: number | undefined;
  insuranceKind: string;
  sumInsured?: {
    min: string;
    max: string;
  };
}

function useGetPackageData(
  packageIds: string[],
  filterValues: FilterValues,
  age: number
) {
  const { id: leadId } = useParams<{ id: string }>();
  const product = useGetProductSelector();

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { data, isLoading } = useGetPackagesQuery(
    {
      productType: product,
      leadId: leadId!,
      healthPackageFilter: `healthPackageFilter.age=${age}`,
    },
    {
      skip: packageIds.length === 0,
    }
  );

  const { data: selectedPackage, isLoading: isSelectedPackageLoading } =
    useGetSelectedPackageQuery(
      { leadId: leadId!, enableDiscountPricing: true },
      {
        skip: packageIds.length !== 0,
      }
    );

  let selectedPackageData = selectedPackage?.carPackageWithPricing ?? {};
  const isHealthProduct = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  if (isHealthProduct) {
    selectedPackageData = (selectedPackage as any)?.healthPackage ?? {};
  }

  // TODO: Transform and format according to health package

  const getPackages = () => {
    let packages: TransformedPackageType[];
    const service = new Transformer(getLanguage() as LANGUAGES);

    if (packageIds.length === 0) {
      const selected = (
        selectedPackageData?.package ? [selectedPackageData.package] : []
      ) as Package[];
      packages = selected ? service.transformApiResponse(selected) : [];
    } else {
      const filteredPackages = (data?.packages ?? []).filter((pkg) =>
        packageIds.includes(
          (pkg?.customPackageResourceName as any) || (pkg?.package?.name as any)
        )
      );

      packages = filterValues
        ? service.transformApiResponse(filteredPackages)
        : [];
      selectedPackageData = filteredPackages[0] as any;
    }
    return packages;
  };

  return {
    packages: getPackages(),
    sumInsuredInfo: {
      min: (selectedPackageData?.sumInsuredMin ?? 0) / 100,
      max: (selectedPackageData?.sumInsuredMax ?? 0) / 100,
    },
    isLoading: isLoading || isSelectedPackageLoading,
    otherInfo: selectedPackageData,
  };
}

export default useGetPackageData;
