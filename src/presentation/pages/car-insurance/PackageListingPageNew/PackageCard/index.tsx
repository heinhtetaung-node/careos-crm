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
import { formatBahtToSatang } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import Actions from './Actions';
import InsurerLogo from './InsurerLogo';
import PackageInfo from './PackageInfo';

import DiscountAndPayment from '../DiscountAndPayment';
import useSelectPackage from '../hooks/useSelectPackage';
import { TransformedPackageType } from '../hooks/useTransformedPackages';
import { FilterInterface } from '../PackageFilter/interface';
import {
  getHeaderTitleByPackageSource,
  generateLendingApiPayload,
  generateDiscountPricingApiPayload,
} from '../packageListing.helper';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

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
  setOpenedPackage?: (arg: string[]) => void;
  refetch?: () => void;
  handleAfterDelete?: () => void;
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
  setOpenedPackage,
  refetch,
  handleAfterDelete,
}: Readonly<PackageCardProps>) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const flags = useFlags([
    FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP,
  ]);
  const isCopyLinkEnabled =
    flags[FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]?.enabled ??
    false;

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

  const handleSelectPackage = async () => {
    if (!leadId) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    const selectPackagePayload = {
      leadId: leadId as string,
      payload: {
        ...filterData,
        ...(setOpenedPackage
          ? { insuranceKind: insurancePackage?.insuranceKind?.toUpperCase() }
          : {}),
        package: insurancePackage.id,
      },
    };

    const response = await selectPackage(selectPackagePayload);
    if ('error' in response) {
      return showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
    refetch?.();
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
      expandPackage(insurancePackage?.id || (insurancePackage as any)?.name);
    }
  };

  const handleDeletePackage = async () => {
    const response = await deletePackage(insurancePackage.id);
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
    if (setOpenedPackage) setOpenedPackage([]);
    setShowDeleteConfirmation(false);
    handleAfterDelete?.();
  };

  useLocationEffect(() => window.scrollTo(0, 0));

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
        data-testid={`package-card-${insurancePackage.id}`}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          className={clsx('grid grid-cols-5 p-3', {
            'bg-muted': disabled,
          })}
          role="button"
          tabIndex={0}
          onClick={() =>
            !disabled &&
            navigate(
              getPackageDetailUrl({
                leadId: params.id,
                packageId: insurancePackage.id,
                otherParams: _omit(filterData, ['package']),
              })
            )
          }
          onKeyDown={undefined}
        >
          <div className="col-span-1">
            <InsurerLogo
              insurancePackage={insurancePackage}
              generatedApiResponse={newFilterData}
              disabled={disabled}
              noCopyLink={!isCopyLinkEnabled}
            />
          </div>
          <div className="col-span-3">
            <PackageInfo
              insurancePackage={insurancePackage}
              onClickPaymentSchedule={() => toogleExpandPackage()}
              disabled={disabled}
            />
          </div>
          <div className="col-span-1">
            <Actions
              isSelected={isSelected}
              isSelectedForCompare={isSelectedForComparison}
              isSelectLoading={selectLoading}
              disabled={disabled || disableAction}
              enableSelect={
                insurancePackage.customQuoteDetail?.approvalStatus ===
                  'APPROVED' ||
                insurancePackage.customQuoteDetail?.approvalStatus ===
                  'APPROVAL_NOT_REQUIRED'
              }
              onSelectClick={onSelectClick}
              onCompareClick={onCompareClick}
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
              {!setOpenedPackage && <Divider />}
              <DiscountAndPayment
                disable={disableAction}
                isPackageSelected={isSelected}
                leadData={leadData}
                onClose={() => toogleExpandPackage()}
                packageData={insurancePackage}
                filter={filterValues}
                setExpendedPackage={expandPackage as any}
                setOpenedPackage={setOpenedPackage}
                refetch={refetch}
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
