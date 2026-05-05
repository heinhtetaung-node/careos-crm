import { Button } from '@alphafounders/ui';
import { CheckCircleIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import { getFilterFromQueryParam } from 'presentation/pages/car-insurance/PackageDetailPage/translatePackage.helper';
import useSelectPackage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useSelectPackage';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { generateLendingApiPayload } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

interface SelectPackageButtonProps {
  packageData: TransformedPackageType;
  isSelected: boolean;
}

function SelectPackageButton({
  packageData,
  isSelected,
}: Readonly<SelectPackageButtonProps>) {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const params = useParams<{ id: string }>();
  const filterValues = getFilterFromQueryParam(queryParams);

  const dispatch = useDispatch();

  const [selectPackage, { isLoading }] = useSelectPackage(params.id!);

  const handleSelect = async () => {
    if (!isSelected) {
      const {
        paymentOption: customPaymentOption,
        paymentMethod: customPaymentMethod,
        numberOfInstallments: customInstallments,
      } = packageData?.customQuoteDetail ?? {};

      const selectPackagePayload = {
        leadId: params.id!,
        payload: generateLendingApiPayload({
          package: packageData.id,
          insuranceKind: packageData.insuranceKind,
          sumInsuredMin: filterValues.sumInsured?.min,
          sumInsuredMax: filterValues.sumInsured?.max,
          paymentOption: customPaymentOption || filterValues?.paymentOption,
          paymentMethod: customPaymentMethod || undefined,
          installment: customInstallments || filterValues?.installment,
        }),
      };

      const response = await selectPackage(selectPackagePayload);
      if ('error' in response) {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('errorMessage.generalErrorMessage'),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
      }
    }
  };

  const btnIcon =
    isSelected && !isLoading ? (
      <CheckCircleIcon className="w-[20px] h-[20px] bg-success text-white rounded-full p-1 mr-2 disabled:bg-gray-300" />
    ) : undefined;
  const selectText = isSelected
    ? getString('packageListing.selected')
    : getString('text.select');

  return (
    <Button
      dataTestId="select-package-button"
      className="w-full cursor-pointer py-4 px-6 uppercase"
      icon={btnIcon}
      text={
        isLoading ? <CircularProgress color="inherit" size={20} /> : selectText
      }
      disabled={
        isLoading ||
        packageData.customQuoteDetail?.approvalStatus === 'PENDING' ||
        packageData.customQuoteDetail?.approvalStatus === 'REJECTED' ||
        !packageData.customQuoteDetail
      }
      onClick={handleSelect}
    />
  );
}

export default SelectPackageButton;
