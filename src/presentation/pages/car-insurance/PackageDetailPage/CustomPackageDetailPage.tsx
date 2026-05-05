import React, { useCallback, useEffect, useMemo } from 'react';

import { useLazyGetCarDataQuery } from 'data/slices/carSlice';
import { customCarData } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import Loader from 'presentation/components/Loader';

import useTranslatePackageData from './useTranslatePackageData';
import usePackageDetailActions from './usePackageDetailActions';
import PackageDetailGuardedContent from './PackageDetailGuardedContent';
import usePackageDetailSetup from './usePackageDetailSetup';

import useTransformedPackages, {
  TransformedPackageType,
} from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import {
  createPackageSourceMap,
  getOriginalPackageSource,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { FilterInterface } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/interface';

interface CarInfoFromId {
  year: number | null;
  brand: string | null;
  model: string | null;
  subModel: string | null;
  carSubModelYear: number | string;
  engineSize: number | null;
  transmissionType: string | null;
  sumInsuredMax: number | null;
  noOfDoor: number | null;
  cabType: string | null;
  isCurated: boolean | null;
}

function CustomPackageDetailPage() {
  const enableMultipleSuminsured = false;

  const {
    params,
    queryParams,
    isPackageDetailView,
    filterValues,
    packageId,
    lead,
    transactions,
    transactionLoading,
    isAuthorizedUserLoading,
    isUserAllowed,
    selectedPackageId,
    orderId,
  } = usePackageDetailSetup({ disableOnSuccessfulTransaction: false });

  const [getCarData, { data: carDataWithIds, isLoading: isLoadingCarData }] =
    useLazyGetCarDataQuery();

  useEffect(() => {
    if (lead?.data?.carSubModelYear && !carDataWithIds) {
      getCarData({
        pathParam: `brands/-/models/-/submodels/-/years/${lead.data.carSubModelYear}:getUniqueCars`,
        queryParam: {},
        field: '',
      });
    }
  }, [lead?.data?.carSubModelYear, getCarData, carDataWithIds]);

  const carInfoFromId = useMemo(() => {
    if (carDataWithIds?.[0] && lead?.data?.carSubModelYear) {
      return customCarData(
        carDataWithIds[0],
        lead.data.carSubModelYear
      ) as CarInfoFromId;
    }
    return null;
  }, [carDataWithIds, lead?.data?.carSubModelYear]);

  const currentData = useMemo<Partial<FilterInterface>>(() => {
    if (!carInfoFromId) return {};
    const {
      year: carYear,
      brand: brandId,
      model: modelId,
      noOfDoor,
      engineSize,
    } = carInfoFromId;

    return {
      year: carYear,
      yearValue: carYear, // (used by useGenericPackagesWithInsurers)
      brand: brandId,
      brandText: brandId,
      model: modelId,
      modelText: modelId,
      subModelText: undefined,
      carSubModelYear: lead?.data?.carSubModelYear,
      drivingPurpose: (queryParams.get('packageFilter.drivingPurpose') ||
        lead?.data?.carUsageType?.toUpperCase()) as FilterInterface['drivingPurpose'],
      dashCam:
        queryParams.get('packageFilter.hasCarDashcam') === 'true' ||
        lead?.data?.carDashCam ||
        false,
      province:
        queryParams.get('packageFilter.province') ||
        lead?.data?.registeredProvince,
      noOfDoors: parseInt(noOfDoor?.toString() ?? '0', 10),
      engineSize: engineSize ?? undefined,
    };
  }, [queryParams, lead?.data, carInfoFromId]);

  const {
    customPackages: transformedCustomPackages,
    carDetails: transformedCarDetails,
    status: transformedStatus,
    rawPackages,
  } = useTransformedPackages(
    params.id!,
    {
      ...currentData,
      sumInsured: filterValues.sumInsured,
      insuranceCategory: filterValues.insuranceKind,
    } as unknown as FilterInterface,
    true, // isNew
    currentData
  );

  const packageSourceMap = useMemo(
    () => createPackageSourceMap(rawPackages ?? []),
    [rawPackages]
  );

  const packageDetail = useMemo(() => {
    if (!packageId) return undefined;

    const found = transformedCustomPackages?.find(
      (pkg: TransformedPackageType) =>
        pkg.name === packageId || pkg.id === packageId
    );
    if (!found) return undefined;

    const originalSource = getOriginalPackageSource(
      found.customQuoteDetail?.originalPackageName,
      packageSourceMap
    );

    return {
      ...found,
      packageSource: originalSource ?? found.packageSource,
    };
  }, [packageId, transformedCustomPackages, packageSourceMap]);

  const finalCarDetails = transformedCarDetails ?? null;
  const finalPackageLoading =
    transformedStatus.isLoading || transformedStatus.isFetching;

  const translatedPackageData = useTranslatePackageData(false, packageDetail);

  const sumInsuredInfo = useMemo(() => {
    if (packageDetail?.sumInsuredInfo) {
      return packageDetail.sumInsuredInfo;
    }
    if (filterValues.sumInsured) {
      return {
        min: Number(filterValues.sumInsured.min) || 0,
        max: Number(filterValues.sumInsured.max) || 0,
      };
    }
    return undefined;
  }, [packageDetail, filterValues.sumInsured]);

  const {
    goBack,
    handleSelect,
    handleCompare,
    handleDownloadQuotation,
    isGeneratingQuotation,
    isSelectPackageLoading,
    packagesForComparison,
    packagesForComparisonNew,
    isPackageSelected: checkIsPackageSelected,
    isValidLead: checkIsValidLead,
  } = usePackageDetailActions({
    leadId: params.id!,
    leadName: lead?.name,
    packageDetail,
    filterValues,
    isPackageDetailView,
    enableMultipleSuminsured,
    sumInsuredInfo,
    lead,
  });

  const handleDownloadQuotationWithLead = useCallback(() => {
    handleDownloadQuotation();
  }, [handleDownloadQuotation]);

  if (
    finalPackageLoading ||
    isAuthorizedUserLoading ||
    transactionLoading ||
    (isLoadingCarData && !currentData.brand)
  ) {
    return <Loader />;
  }

  return (
    <PackageDetailGuardedContent
      leadId={params.id}
      lead={lead}
      hasTransactions={Boolean(transactions?.charges?.length)}
      isUserAllowed={Boolean(isUserAllowed)}
      orderId={orderId}
      packageDetail={packageDetail}
      translatedPackageData={translatedPackageData}
      carDetails={finalCarDetails}
      onSelect={handleSelect}
      onGoBack={goBack}
      onDownloadQuotation={handleDownloadQuotationWithLead}
      onCompare={handleCompare}
      showButtons={checkIsValidLead(lead) && isPackageDetailView}
      isDownloadLoading={isGeneratingQuotation}
      isSelectLoading={isSelectPackageLoading}
      isSelectedForComparison={
        enableMultipleSuminsured
          ? packagesForComparisonNew
              .map((pkg) => pkg.name)
              .includes(packageDetail?.id)
          : packagesForComparison.includes(packageDetail?.id ?? '')
      }
      isSelected={checkIsPackageSelected(selectedPackageId)}
    />
  );
}

export default CustomPackageDetailPage;
