import React, { useCallback, useMemo } from 'react';
import transformPackages from 'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation';

import Loader from 'presentation/components/Loader';

import useGetPackageData from './useGetPackageData';
import useTranslatePackageData from './useTranslatePackageData';
import usePackageDetailActions from './usePackageDetailActions';
import PackageDetailGuardedContent from './PackageDetailGuardedContent';
import usePackageDetailSetup from './usePackageDetailSetup';

import { useGetGenericPackageDetailQuery } from 'data/slices/genericPackageSlice';
import transformPackageFromGenericToNormal from './transformPackageFromGenericToNormal';

function PackageDetailPage() {
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

  const {
    data: genericPackageDetail,
    isLoading: isLoadingGenericPackageDetail,
  } = useGetGenericPackageDetailQuery(
    {
      id: packageId,
      carSubModelYear: lead?.data?.carSubModelYear,
      insuranceKind: lead?.data?.insuranceKind?.toString().toUpperCase(),
    },
    { skip: !packageId?.startsWith('premiums/') || !lead?.data?.insuranceKind }
  );

  const isGenericPackage = packageId?.startsWith('premiums/');

  // Use useGetPackageData for non-generic packages (i.e. packages without the premiums/ prefix)
  const {
    packages,
    sumInsuredInfo,
    isLoading: packageLoading,
    carDetails,
  } = useGetPackageData(
    isPackageDetailView ? [queryParams.get('id') ?? ''] : [],
    {
      ...filterValues,
      otherParams: {
        newSearch: queryParams.get('packageFilter.newSearch'),
        carSubModelYear: queryParams.get('packageFilter.newSearch'),
        model: queryParams.get('packageFilter.modelId'),
        brand: queryParams.get('packageFilter.brandId'),
        year: queryParams.get('packageFilter.carYear'),
      },
    },
    isGenericPackage
  );

  const transformedPackage =
    transformPackageFromGenericToNormal(genericPackageDetail);

  // Find the specific package
  const packageDetail = useMemo(() => {
    const insuranceCategory = {
      insuranceCategory: genericPackageDetail?.package?.insuranceCategory,
    } as any;
    if (isGenericPackage && genericPackageDetail) {
      return transformPackages(
        [transformedPackage] as any,
        insuranceCategory
      )[0];
    }

    return packages[0];
  }, [isGenericPackage, genericPackageDetail, transformedPackage, packages]);

  const finalCarDetails = carDetails;
  const finalPackageLoading = packageLoading;

  const translatedPackageData = useTranslatePackageData(
    false,
    packageDetail as any
  );

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
    isLoadingGenericPackageDetail
  ) {
    return <Loader />;
  }

  return (
    <PackageDetailGuardedContent
      lead={lead}
      leadId={params.id}
      isUserAllowed={Boolean(isUserAllowed)}
      hasTransactions={Boolean(transactions?.charges?.length)}
      packageDetail={packageDetail}
      orderId={orderId}
      carDetails={finalCarDetails}
      translatedPackageData={translatedPackageData}
      onGoBack={goBack}
      onSelect={handleSelect}
      onCompare={handleCompare}
      onDownloadQuotation={handleDownloadQuotationWithLead}
      isSelectLoading={isSelectPackageLoading}
      isDownloadLoading={isGeneratingQuotation}
      isSelected={checkIsPackageSelected(selectedPackageId)}
      isSelectedForComparison={
        enableMultipleSuminsured
          ? packagesForComparisonNew
              .map((pkg) => pkg.name)
              .includes(packageDetail?.id)
          : packagesForComparison.includes(packageDetail?.id)
      }
      showButtons={checkIsValidLead(lead) && isPackageDetailView}
    />
  );
}

export default PackageDetailPage;
