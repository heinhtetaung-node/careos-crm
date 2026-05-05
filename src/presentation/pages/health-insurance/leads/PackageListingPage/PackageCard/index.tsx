import { FileIcon, TrashIcon } from '@alphafounders/icons';
import { Button, Card, Divider, SmoothMount } from '@alphafounders/ui';
import clsx from 'clsx';
import _omit from 'lodash/omit';
import React, { useEffect, useState } from 'react';
import {
  type Location,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useDeletePackageMutation } from 'data/slices/discountAndPricingSlice';
import CommonModal from 'presentation/components/modal/CommonModal';
import { getPackageDetailUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';
import { useGetTransactionByLeadIdQuery } from 'data/slices/transactionSlice';
import { formatBahtToSatang, satangToBaht } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import InsurerLogo from 'presentation/pages/car-insurance/PackageListingPageNew/PackageCard/InsurerLogo';

import DiscountAndPayment from 'presentation/pages/car-insurance/PackageListingPageNew/DiscountAndPayment';
import useSelectPackage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useSelectPackage';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { FilterInterface } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/interface';
import {
  getHeaderTitleByPackageSource,
  generateLendingApiPayload,
  generateDiscountPricingApiPayload,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { PRODUCTS } from 'config/TypeFilter';
import Actions from 'presentation/pages/car-insurance/PackageListingPageNew/PackageCard/Actions';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';
import {
  useGetDiscountDetailQuery,
  useLazyGetDiscountDetailQuery,
} from 'data/slices/discountSlice';

import PackageInfoHealth from 'presentation/pages/health-insurance/leads/PackageListingPage/PackageInfo';

function useLocationEffect(callback: (location?: Location<any>) => any) {
  const location = useLocation();

  useEffect(() => {
    callback(location);
  }, [location, callback]);
}

interface PackageCardProps {
  insurancePackage: TransformedPackageType;
  isSelected: boolean;
  isExpanded: boolean;
  isSelectedForComparison: boolean;
  filterValues: FilterInterface;
  disabled?: boolean;
  disableAction?: boolean;
  onComparePackage: (arg: string) => void;
  onRemoveFromComparison: (arg: string) => void;
  expandPackage: (arg: string) => void;
  leadData: any;
  packageType?: string;
  refetch?: () => void;
  setExpendedPackage?: (arg: string | null) => void;
  selProductCategory: string;
}

function PackageCard({
  insurancePackage,
  isSelected,
  isExpanded,
  isSelectedForComparison,
  filterValues,
  disabled,
  disableAction,
  onComparePackage,
  onRemoveFromComparison,
  expandPackage,
  leadData,
  packageType,
  refetch,
  setExpendedPackage,
  selProductCategory,
}: Readonly<PackageCardProps>) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const leadId = params?.id;

  const [selectPackage, { isLoading: selectLoading }] = useSelectPackage(
    leadId ?? ''
  );
  const [deletePackage, { isLoading: deleteLoading }] =
    useDeletePackageMutation();

  const { data: transactionData, isLoading: gettingTransactions } =
    useGetTransactionByLeadIdQuery(
      { leadId: `leads/${leadId}` },
      { skip: !leadId }
    );

  const [discountSource, setDiscountSource] = useState<string | null>(
    insurancePackage?.customQuoteDetail?.discountSource || null
  );

  const {
    data: discountDetail,
    isLoading,
    isError,
  } = useGetDiscountDetailQuery(
    {
      name: discountSource ?? '',
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !discountSource,
    }
  );

  const [campaignSource, setCampaignSource] = useState<string | null>(null);

  useEffect(() => {
    if (discountDetail?.requestResource) {
      setDiscountSource(discountDetail?.requestResource);
    }
    if (discountDetail?.source) {
      setCampaignSource(discountDetail?.source);
    }
  }, [discountDetail]);

  const {
    paymentOption: customPaymentOption,
    paymentMethod: customPaymentMethod,
    numberOfInstallments: customInstallments,
  } = insurancePackage?.customQuoteDetail ?? {};

  const filterData = generateLendingApiPayload({
    insuranceKind: filterValues?.insuranceCategory,
    sumInsuredMin: filterValues?.isDefaultSumInsured
      ? undefined
      : formatBahtToSatang(filterValues?.sumInsured?.min),
    sumInsuredMax: filterValues?.isDefaultSumInsured
      ? undefined
      : formatBahtToSatang(filterValues?.sumInsured?.max),
    paymentOption: customPaymentOption || 'FULL_PAYMENT',
    paymentMethod: customPaymentMethod || 'QR_CODE',
    installment: customInstallments || 1,
  });

  const newFilterData = generateDiscountPricingApiPayload([
    {
      package: insurancePackage?.id,
      insuranceKind: insurancePackage?.insuranceKind,
      sumInsuredMin: filterValues?.isDefaultSumInsured
        ? undefined
        : formatBahtToSatang(filterValues?.sumInsured?.min),
      sumInsuredMax: filterValues?.isDefaultSumInsured
        ? undefined
        : formatBahtToSatang(filterValues?.sumInsured?.max),
      paymentOption: customPaymentOption || 'FULL_PAYMENT',
      paymentMethod: customPaymentMethod || 'QR_CODE',
      installment: customInstallments || 1,
    },
  ]);

  const onCompareClick = () => {
    if (isSelectedForComparison) {
      onRemoveFromComparison(insurancePackage.id);
    } else {
      onComparePackage(insurancePackage.id);
    }
  };

  const goBackToPackage = () => {
    setTimeout(() => {
      window.location.href = `#${insurancePackage?.customPackageResourceName?.split('/')?.[1] || insurancePackage?.name?.split('/')?.[3]}`;
    }, 10);
  };

  const handleSelectPackage = async () => {
    if (!leadId) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    const selectPackagePayload = {
      leadId: leadId as string,
      payload: {
        selectHealthPackage: {
          ...filterData,
          package: insurancePackage?.customPackageResourceName,
        },
      },
    };
    const response = await selectPackage(selectPackagePayload as any);
    if ('error' in response) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    if (setExpendedPackage) setExpendedPackage(null);
    goBackToPackage();
    return setConfirmModal(false);
  };

  const onSelectClick = async () => {
    if (!transactionData?.transactions) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    const isPendingLead = transactionData.transactions.filter(
      (transaction: { statusCode: string }) =>
        transaction.statusCode === 'PENDING'
    );

    if (isPendingLead.length) {
      // show modal to confirm
      setConfirmModal(true);
      return true;
    }
    await handleSelectPackage();
    return '';
  };

  const toogleExpandPackage = () => {
    if (isExpanded) {
      expandPackage('');
    } else {
      expandPackage(
        insurancePackage?.customPackageResourceName || insurancePackage?.name
      );
      goBackToPackage();
    }
  };

  const handleDeletePackage = async () => {
    const response = await deletePackage(
      insurancePackage.customPackageResourceName
    );
    if ('error' in response) {
      const { data } = response.error as any;

      showErrorSnackbar(
        data?.message
          ? getString('text.errorMessage', { message: data.message })
          : getString('errorMessage.generalErrorMessage')
      );
    } else {
      showSuccessSnackbar(getString('text.success'));
    }
    setShowDeleteConfirmation(false);
  };

  const approvalPassStatus = ['APPROVED', 'APPROVAL_NOT_REQUIRED'];

  useLocationEffect(() => window.scrollTo(0, 0));

  const getEnableSelect = () => {
    if (discountDetail?.status) {
      return approvalPassStatus.includes(discountDetail?.status);
    }
    return approvalPassStatus.includes(
      insurancePackage?.customPackageStatus || ''
    );
  };

  return (
    <>
      <Card
        title={getHeaderTitleByPackageSource(insurancePackage.packageSource)}
        variant={insurancePackage.headerType}
        action={
          insurancePackage.packageSource === 'custom' && (
            <TrashIcon
              data-testid="delete-package"
              onClick={() => setShowDeleteConfirmation(true)}
            />
          )
        }
        data-testid={`package-card-${insurancePackage.name}`}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          id={`${insurancePackage?.customPackageResourceName?.split('/')?.[1] || insurancePackage?.name?.split('/')?.[3]}`}
          className={clsx('grid grid-cols-5 p-3', { 'bg-muted': disabled })}
          role="button"
          tabIndex={0}
          // !important need to open back after package detail finished
          onClick={() =>
            !disabled &&
            navigate(
              getPackageDetailUrl({
                leadId: params.id,
                isHealth: true,
                packageId: isSelected
                  ? undefined
                  : insurancePackage.customPackageResourceName ||
                    insurancePackage.name,
                otherParams: _omit(filterData, ['package']),
              })
            )
          }
        >
          <div className="col-span-1">
            <InsurerLogo
              insurancePackage={{
                ...insurancePackage,
                logo: `https://storage.googleapis.com/skillful-rush/${insurancePackage.insurer}.png`,
                title:
                  getString('text.yes') === 'Yes'
                    ? insurancePackage?.displayNameEn
                    : insurancePackage?.displayNameTh,
              }}
              generatedApiResponse={newFilterData}
              disabled
              noDownload
              noCopyLink
            />
          </div>
          <div className="col-span-3">
            <PackageInfoHealth
              insurancePackage={
                {
                  ...insurancePackage,
                  premium: formatCoverage(
                    satangToBaht(
                      (insurancePackage as any)?.priceSummary
                        ?.netPremiumAmount || insurancePackage?.premium?.units
                    )
                  ),
                } as any
              }
              selProductCategory={(insurancePackage as any)?.category}
              onClickPaymentSchedule={() => toogleExpandPackage()}
              discountStatus={discountDetail?.status}
            />
          </div>
          <div className="col-span-1">
            <Actions
              isSelected={isSelected}
              isSelectedForCompare={isSelectedForComparison}
              isSelectLoading={selectLoading}
              disabled={disabled || disableAction}
              enableSelect={getEnableSelect()}
              onSelectClick={onSelectClick}
              onCompareClick={onCompareClick}
              noCompare
            />
            {insurancePackage.insuranceKind === 'both' ? (
              <div>
                <p
                  className="my-1 text-success font-bold text-center"
                  data-testid="compulsory-text"
                >
                  {getString('packageListing.includingCompulsoryPrice')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        {isExpanded && (
          <SmoothMount>
            <div className="w-full">
              <Divider />
              <DiscountAndPayment
                disable={disableAction}
                isPackageSelected={isSelected}
                leadData={leadData}
                onClose={() => toogleExpandPackage()}
                packageData={{
                  ...insurancePackage,
                  customQuoteDetail: {
                    ...insurancePackage?.customQuoteDetail,
                    discount:
                      insurancePackage?.customQuoteDetail?.priceDetail
                        ?.priceSummary?.discount,
                    discountRequest: {
                      source: campaignSource,
                      discountPercentage:
                        insurancePackage?.customQuoteDetail?.priceDetail
                          ?.priceSummary?.discount?.percentage,
                      discountAmount:
                        insurancePackage?.customQuoteDetail?.priceDetail
                          ?.priceSummary?.discount?.amount,
                      approver: insurancePackage?.customQuoteDetail?.approver,
                      approverRemark:
                        insurancePackage?.customQuoteDetail?.approverRemark,
                    },
                  } as any,
                }}
                filter={filterValues}
                setExpendedPackage={setExpendedPackage}
              />
            </div>
          </SmoothMount>
        )}
      </Card>
      <CommonModal
        open={showDeleteConfirmation}
        handleCloseModal={() => setShowDeleteConfirmation(false)}
        dataTestId="delete-modal"
      >
        <div className="p-8">{getString('text.deleteConfirmation')}</div>
        <div className="flex justify-center mb-4">
          <Button
            className="p-3 mx-1"
            variant="secondary"
            text={getString('text.cancelButton')}
            onClick={() => setShowDeleteConfirmation(false)}
          />
          <Button
            className="p-3 mx-1"
            text={getString('text.confirmButton')}
            isLoading={deleteLoading}
            onClick={handleDeletePackage}
          />
        </div>
      </CommonModal>
      {/* Confirm Modal */}
      <CommonModal
        open={confirmModal}
        handleCloseModal={() => setConfirmModal(false)}
        dataTestId="confirm-modal"
      >
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center bg-primaryColor bg-opacity-20 p-5 rounded-full">
            <FileIcon fillColor="primary" className="fill-primary h-12 w-12" />
          </div>
          <div className="flex flex-col gap-2 items-center text-lg font-medium text-gray-600 text-center">
            <span>{getString('text.selectingPendingTransactionQuote')}</span>
            <span>{getString('text.confirmSelectedQuote')}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              className="py-3 px-6"
              variant="secondary"
              text={getString('text.cancelButton')}
              disabled={gettingTransactions || selectLoading}
              onClick={() => setConfirmModal(false)}
            />
            <Button
              className="py-3 px-6"
              variant="primary"
              text={getString('text.confirmButton')}
              isLoading={gettingTransactions || selectLoading}
              disabled={gettingTransactions || selectLoading}
              onClick={handleSelectPackage}
            />
          </div>
        </div>
      </CommonModal>
    </>
  );
}

export default React.memo(PackageCard);
