import {
  DisclaimerSection,
  InfoContainer,
  InfoSection,
  Button,
  InfoLeadCar,
} from '@alphafounders/ui';
import { DownloadFileIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import {
  removeFromComparison,
  usePackagesForComparison,
} from 'data/slices/packageListing';
import { useGetSuccessfulTransactionQuery } from 'data/slices/transactionSlice';
import Loader from 'presentation/components/Loader';
import NotFound from 'presentation/components/NotFound';
import useAuthorizedUsers from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useAuthorizedUsers';
import {
  generateDiscountPricingApiPayload,
  isValidLead,
  CommonPayload,
  mergeTransformedPackagesForComparePage,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getPackagesUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';

import StickyHeader from './StickyHeader';

import { isMotorLead } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { getFilterFromQueryParam } from 'presentation/pages/car-insurance/PackageDetailPage/translatePackage.helper';
import useGetPackageData from 'presentation/pages/car-insurance/PackageDetailPage/useGetPackageData';
import useTranslatePackageData from 'presentation/pages/car-insurance/PackageDetailPage/useTranslatePackageData';
import useGenerateQuotation from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useGenerateQuotation';
import { isHealthLead } from 'presentation/pages/health-insurance/leads/leadDetailsPage/helper';
import { useLazyGetGenericPackageDetailQuery } from 'data/slices/genericPackageSlice';
import transformPackageFromGenericToNormal from '../PackageDetailPage/transformPackageFromGenericToNormal';
import transformPackages from '../PackageListingPageNew/packageTransformation';

function PackageComparisonPage() {
  const disableOnSuccessfulTransaction = false;

  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: lead } = useGetLeadByIDQuery(params.id!);
  const { data: transactions, isLoading: transactionLoading } =
    useGetSuccessfulTransactionQuery(lead?.name ?? '', {
      skip: !lead?.name || !disableOnSuccessfulTransaction,
    });
  const { search } = useLocation();

  const orderId = `${getString('text.orderId')}: ${lead?.humanId || ''}`;

  const queryParams = new URLSearchParams(search);
  const filterValues = getFilterFromQueryParam(queryParams);

  const selectedPackageId = lead?.data?.checkout?.package ?? '';

  const comparedPackageIds = usePackagesForComparison();

  const idsForComparison = useMemo(
    () => [...new Set(comparedPackageIds)],
    [comparedPackageIds]
  );

  const [getGenericPackage] = useLazyGetGenericPackageDetailQuery();
  const [premiumPackages, setPremiumPackages] = useState<any[]>([]);

  const {
    packages,
    isLoading: packagesLoading,
    carDetails,
  } = useGetPackageData(idsForComparison, {
    ...filterValues,
    otherParams: {
      newSearch: queryParams.get('packageFilter.newSearch'),
      model: queryParams.get('packageFilter.modelId'),
      brand: queryParams.get('packageFilter.brandId'),
      year: queryParams.get('packageFilter.carYear'),
    },
  });

  const prepareComparedPackages = async () => {
    let insuranceCategory = '';
    const packagePromises = idsForComparison
      .filter((packageId) => packageId.startsWith('premiums/'))
      .map(async (packageId) => {
        const packageDetail = await getGenericPackage({
          id: packageId,
          carSubModelYear: lead?.data?.carSubModelYear || 0,
          insuranceKind: lead?.data?.insuranceKind?.toString().toUpperCase(),
        }).unwrap();
        const normalPackageTransformed =
          transformPackageFromGenericToNormal(packageDetail);
        insuranceCategory = normalPackageTransformed?.insuranceCategory || '';
        return normalPackageTransformed;
      });
    const transformedPremiumPackages = transformPackages(
      (await Promise.all(packagePromises)) as any,
      {
        insuranceCategory,
      } as any
    );
    setPremiumPackages(transformedPremiumPackages);
  };

  useEffect(() => {
    if (lead?.data && idsForComparison.length) prepareComparedPackages();
  }, [idsForComparison, lead]);

  const [showDifference, setShowDifference] = useState<boolean>(false);

  const displayPackages = useMemo(
    () =>
      mergeTransformedPackagesForComparePage(
        comparedPackageIds,
        packages,
        premiumPackages
      ),
    [comparedPackageIds, packages, premiumPackages]
  );

  const transformedPackageData = useTranslatePackageData(
    showDifference,
    ...displayPackages
  );

  const { generateQuotation, isLoading } = useGenerateQuotation();

  const { isLoading: isAuthorizedUserLoading, isUserAllowed } =
    useAuthorizedUsers(lead?.name);

  const goBack = () => {
    navigate(getPackagesUrl(params.id));
  };

  const handleRemovePackage = (packageId: string) => {
    dispatch(removeFromComparison(packageId));
    goBack();
  };

  const handleDownloadQuotation = () => {
    const rawData: CommonPayload[] = displayPackages.map((packageData) => {
      const {
        paymentOption: customPaymentOption,
        paymentMethod: customPaymentMethod,
        numberOfInstallments: customInstallments,
      } = packageData?.customQuoteDetail ?? {};

      return {
        package: packageData.id,
        insuranceKind: packageData.insuranceKind || filterValues.insuranceKind,
        sumInsuredMin: filterValues.sumInsured?.min,
        sumInsuredMax: filterValues.sumInsured?.max,
        paymentOption: customPaymentOption || filterValues.paymentOption,
        paymentMethod: customPaymentMethod || undefined,
        installment: customInstallments || filterValues.installment,
      };
    });

    const quotationPayload = generateDiscountPricingApiPayload(rawData);

    generateQuotation({
      leadId: `leads/${params.id}`,
      carInsuranceQuotationFilter: quotationPayload,
    });
  };

  if (packagesLoading || isAuthorizedUserLoading || transactionLoading) {
    return <Loader />;
  }

  if (
    !displayPackages.length ||
    !isValidLead(lead) ||
    !isUserAllowed ||
    !isMotorLead(lead) ||
    transactions?.charges?.length
  ) {
    return (
      <NotFound
        text={getString('errorPage.packageNotFound')}
        btnText={getString('errorPage.goToLead')}
        redirectTo={`${isHealthLead(lead) ? '/health' : ''}/leads/${params.id}`}
      />
    );
  }

  return (
    <div
      className="w-full h-full bg-white"
      data-testid="package-comparison-page"
    >
      <StickyHeader
        selectedPackageId={selectedPackageId}
        packages={displayPackages}
        onClickBack={goBack}
        onRemove={handleRemovePackage}
      />
      <div className="container mx-auto pt-[40px] pb-[130px] flex flex-col items-center justify-center box-border text-center">
        <InfoLeadCar
          title={`${getString('packageListing.showingPackageDetailsFor')}:`}
          orderId={orderId}
          carDetails={carDetails || null}
        />
        <Button
          text={
            isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              getString('packageListing.downloadQuotation')
            )
          }
          onClick={handleDownloadQuotation}
          icon={<DownloadFileIcon className="mr-2" />}
          variant="secondary"
          className="py-4 px-6 m-3 text-base mx-auto min-w-[230px] max-h-[50px] hover:bg-primary-light"
          disabled={isLoading}
        />
        <Button
          text={
            showDifference
              ? getString('packageListing.showFullDetail')
              : getString('packageListing.showOnlyDifference')
          }
          onClick={() => setShowDifference(!showDifference)}
          variant="secondary"
          className="py-4 px-6 mt-4 mb-8 text-base mx-auto hover:bg-primary-light"
        />
        <InfoContainer>
          {transformedPackageData.map((section: any) => (
            <InfoSection key={section.key} data={section} />
          ))}
          <DisclaimerSection
            listStyleImage="/static/img/rabbit-heart-logo.svg"
            title={getString('remark.title')}
            description={getString('remark.description')}
          />
        </InfoContainer>
        <Button
          text={
            isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              getString('packageListing.downloadQuotation')
            )
          }
          onClick={handleDownloadQuotation}
          icon={<DownloadFileIcon className="mr-2" />}
          variant="secondary"
          className="py-4 px-6 m-3 text-base mx-auto min-w-[230px] max-h-[50px] hover:bg-primary-light"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default PackageComparisonPage;
