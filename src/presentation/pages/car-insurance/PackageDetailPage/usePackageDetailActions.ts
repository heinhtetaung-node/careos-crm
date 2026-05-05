import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

import {
  addToComparison,
  usePackagesForComparison,
} from 'data/slices/packageListing';
import { getMaximumPackageLimit } from 'data/slices/packageListing/helper';
import {
  isValidLead,
  generateLendingApiPayload,
  generateDiscountPricingApiPayload,
  isPackageSelected,
} from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getPackagesUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

import useGenerateQuotation from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useGenerateQuotation';
import usePackageStorage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/usePackageStorage';
import useSelectPackage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useSelectPackage';

interface UsePackageDetailActionsProps {
  leadId: string;
  leadName?: string;
  packageDetail: any;
  filterValues: {
    sumInsured?: { min?: string; max?: string };
    paymentOption?: string;
    installment?: number;
    insuranceKind?: string;
  };
  isPackageDetailView: boolean;
  enableMultipleSuminsured?: boolean;
  sumInsuredInfo?: { min: number; max: number };
  lead?: any; // For accessing checkout data
}

export default function usePackageDetailActions({
  leadId,
  leadName,
  packageDetail,
  filterValues,
  isPackageDetailView,
  enableMultipleSuminsured = false,
  sumInsuredInfo,
  lead,
}: UsePackageDetailActionsProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { generateQuotation, isLoading: isGeneratingQuotation } =
    useGenerateQuotation();
  const packagesForComparison = usePackagesForComparison();
  const {
    packageData: packagesForComparisonNew,
    addToComparison: addForComparisonNew,
  } = usePackageStorage();
  const [selectPackage, { isLoading: isSelectPackageLoading }] =
    useSelectPackage(leadId);

  const goBack = () => {
    if (isPackageDetailView) {
      navigate(getPackagesUrl(leadId));
    } else {
      navigate(`/${leadName as string}`);
    }
  };

  const handleSelect = async () => {
    const {
      paymentOption: customPaymentOption,
      paymentMethod: customPaymentMethod,
      numberOfInstallments: customInstallments,
    } = packageDetail?.customQuoteDetail ?? {};
    const selectPackagePayload = {
      leadId,
      payload: generateLendingApiPayload({
        package: packageDetail.id,
        insuranceKind: packageDetail.insuranceKind,
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
  };

  const handleCompare = () => {
    if (enableMultipleSuminsured) {
      if (
        packagesForComparisonNew.some((pkg) => pkg.name === packageDetail.id)
      ) {
        navigate(getPackagesUrl(leadName?.split('/')?.[1] ?? leadId));
        return;
      }
      addForComparisonNew({
        detail: packageDetail,
        sumInsuredMax: filterValues.sumInsured?.max,
        sumInsuredMin: filterValues.sumInsured?.min,
        insuranceCategory: filterValues.insuranceKind ?? '',
        name: packageDetail.id,
      });
    } else {
      if (packagesForComparison.includes(packageDetail.id)) {
        navigate(getPackagesUrl(leadName?.split('/')?.[1] ?? leadId));
        return;
      }
      dispatch(
        addToComparison({
          id: packageDetail.id,
          maxLimit: getMaximumPackageLimit(),
        })
      );
    }
    navigate(getPackagesUrl(leadName?.split('/')?.[1] ?? leadId));
  };

  const paymentDetails = useMemo(() => {
    if (packageDetail?.customQuoteDetail) {
      return {
        paymentOption: packageDetail.customQuoteDetail.paymentOption,
        paymentMethod: packageDetail.customQuoteDetail.paymentMethod,
        installment: packageDetail.customQuoteDetail.numberOfInstallments,
      };
    }

    return {
      paymentOption: isPackageDetailView
        ? filterValues.paymentOption
        : lead?.data?.checkout?.paymentOption,
      installment: isPackageDetailView
        ? filterValues.installment
        : lead?.data?.checkout?.installments,
    };
  }, [
    packageDetail?.customQuoteDetail,
    isPackageDetailView,
    filterValues.paymentOption,
    filterValues.installment,
    lead?.data?.checkout,
  ]);
  const handleDownloadQuotation = () => {
    const insuranceKind =
      (isPackageDetailView && packageDetail.insuranceKind) ||
      lead?.data?.insuranceKind ||
      'BOTH';

    const quotationPayload = generateDiscountPricingApiPayload([
      {
        package: packageDetail.id,
        insuranceKind,
        sumInsuredMin: isPackageDetailView
          ? filterValues.sumInsured?.min
          : sumInsuredInfo?.min?.toString() || filterValues.sumInsured?.min,
        sumInsuredMax: isPackageDetailView
          ? filterValues.sumInsured?.max
          : sumInsuredInfo?.max?.toString() || filterValues.sumInsured?.max,
        ...paymentDetails,
      },
    ]);

    generateQuotation({
      leadId: `leads/${leadId}`,
      carInsuranceQuotationFilter: quotationPayload,
    });
  };

  return {
    goBack,
    handleSelect,
    handleCompare,
    handleDownloadQuotation,
    isGeneratingQuotation,
    isSelectPackageLoading,
    packagesForComparison,
    packagesForComparisonNew,
    isPackageSelected: (selectedPackageId: string) =>
      isPackageSelected(packageDetail, selectedPackageId),
    isValidLead: (leadResourceName: any) => isValidLead(leadResourceName),
  };
}
