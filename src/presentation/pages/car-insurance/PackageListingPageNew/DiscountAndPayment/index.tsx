import { Button, Divider } from '@alphafounders/ui';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useFlags } from 'flagsmith/react';
import { Form, FormikProvider, useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';

import {
  useCreatePackageMutation,
  useGetCustomPackageMutation,
  useGetVoucherMutation,
  useUpdatePackageMutation,
} from 'data/slices/discountAndPricingSlice';
import {
  DocumentUploadResponse,
  useUploadDocumentMutation,
} from 'data/slices/documentUploadSlice';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';
import { Lead } from 'shared/types/lead';
import useSnackbar from 'utils/snackbar';

import AddonAndShipping from './AddonAndShipping';
import CommentModal from './CommentModal';
import DiscountSection from './Discount';
import { DiscountType } from './Discount/helper';
import {
  checkRequireDiscountRequest,
  getFormattedError,
  updateEligibleVoucherInformation,
  validationSchema,
} from './helper';
import PricingSection from './Pricing';
import SkeletonRow from './Pricing/Common/SkeletonRow';
import usePaymentInformation from './usePaymentInformation';

import FeatureFlags from 'config/flagsmithConfig';
import Checkbox from 'presentation/components/controls/Checkbox';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { satangToBaht } from 'utils/currency';
import { FilterInterface } from '../PackageFilter/interface';

interface Form {
  discountType?: string;
  campaignName?: string;
  discountPercentage: number;
  paymentMethod: string;
  paymentOption: string;
  numberOfInstallment: number;
  cardProvider?: string;
  addOn?: string[];
  deliveryOption?: string;
}

interface DiscountPricingProps {
  onClose: () => void;
  isPackageSelected: boolean;
  leadData: Lead;
  packageData: TransformedPackageType;
  filter: FilterInterface;
  disable?: boolean;
  setExpendedPackage?: (id: string | null) => void;
  setOpenedPackage?: (arg: string[]) => void;
  refetch?: () => void;
}

function DiscountAndPayment({
  onClose,
  isPackageSelected,
  leadData,
  packageData,
  filter,
  disable,
  setExpendedPackage,
  setOpenedPackage,
  refetch,
}: DiscountPricingProps) {
  const [isCommentModalOpen, setOpenCommentModal] = useState(false);
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const isMotorProduct = globalProduct === 'products/car-insurance';
  const [showPricing, setShowPricing] = useState(false);
  const [isEnabledVoucher, setIsEnabledVoucher] = useState(false);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [isVoucherEligible, setIsVoucherEligible] = useState(false);
  const discountRef = useRef<{
    approver: string;
    maxDiscount: number;
    requestedDiscountPercentage: number;
    requestedDiscountAmount: number;
  }>();

  const { showErrorSnackbar } = useSnackbar();

  const [createPackage, { isSuccess }] = useCreatePackageMutation();
  const [updatePackage] = useUpdatePackageMutation();
  const [uploadFile] = useUploadDocumentMutation();
  const { resetCheckout } = useLeadUpdater();
  const customErrorMessages: { [key: string]: string } = {
    error_msg_block_change_package: getString(
      'carepay.errors.errorMsgBlockChangePackage'
    ),
  };

  const flags = useFlags([
    FeatureFlags.BROK_3220_ENABLE_VOUCHER_CHECKBOX_ON_PAYMENT_DETAIL_20251007,
  ]);

  const isEnableVoucherFlag =
    flags[
      FeatureFlags.BROK_3220_ENABLE_VOUCHER_CHECKBOX_ON_PAYMENT_DETAIL_20251007
    ]?.enabled ?? false;

  useEffect(() => {
    if (isSuccess && setOpenedPackage) setOpenedPackage([]);
  }, [isSuccess]);
  const [
    getVoucher,
    { data: voucherEligibility, isLoading: isVoucherLoading },
  ] = useGetVoucherMutation();
  const [getCustomPackage] = useGetCustomPackageMutation();

  const handleErrors = (error: FetchBaseQueryError | SerializedError) => {
    const formattedErrorResponse = getFormattedError(error);
    let errorMessage = formattedErrorResponse;
    if (customErrorMessages[formattedErrorResponse]) {
      errorMessage = customErrorMessages[formattedErrorResponse];
    }
    setOpenedPackage?.([]);
    showErrorSnackbar(errorMessage);
  };

  const isDocumentUploadFailed = (
    documentResources: any
  ): documentResources is DocumentUploadResponse[] => {
    const hasError = documentResources.filter(
      (resource: any) => 'error' in resource
    );

    return hasError.length > 0;
  };

  async function uploadDocument(files: File[]) {
    const documentRequests = files.map((fileData) =>
      uploadFile({
        fileName: fileData.name,
        contentType: fileData.type,
        file: fileData,
      })
    );

    const documentResources = await Promise.all(documentRequests);

    if (documentResources) {
      if (!isDocumentUploadFailed(documentResources)) {
        return documentResources.map((res: any) => ({
          name: res?.data?.documentResource as string,
          label: res?.data?.documentName as string,
        }));
      }
    }
    return undefined;
  }

  const createCustomPackage = async (
    values: Form,
    comment?: string,
    files?: File[]
  ) => {
    let payload = {
      parent: `${leadData.name}/${packageData?.id || packageData?.name}`,
      discountType: values.discountType,
      discountPercentage: Math.round(values.discountPercentage),
      discountSource: values.campaignName,
      remark: comment,
      paymentOption:
        values.paymentOption === 'DIRECT_DEBIT_INSTALLMENT'
          ? 'RABBIT_CARE_INSTALLMENT'
          : values.paymentOption,
      paymentMethod: values.paymentMethod,
      cardProvider: values.cardProvider,
      numberOfInstallments: values.numberOfInstallment,
      documents: undefined as undefined | { name: string; label: string }[],
      insuranceKind: setOpenedPackage
        ? packageData?.insuranceKind?.toUpperCase()
        : filter?.insuranceCategory?.toUpperCase(),
      deliveryOption: values.deliveryOption,
    };
    if (isEnableVoucherFlag && isMotorProduct) {
      payload = updateEligibleVoucherInformation(
        payload,
        voucherEligibility,
        isVoucherEligible
      );
    }
    if (files) {
      const documentResources = await uploadDocument(files);

      if (documentResources) {
        payload.documents = documentResources;
      } else {
        showErrorSnackbar(getString('text.uploadFailed'));
        newrelic?.noticeError?.(
          'Error while uploading discount request document'
        );
      }
    }
    const response = await createPackage({
      resourceId: `${leadData.name}/${packageData?.id || packageData?.name}`,
      payload,
    });
    if (!('error' in response) && refetch) refetch();
    return response;
  };

  const updateCustomPackage = async (
    values: Form,
    comment?: string,
    files?: File[]
  ) => {
    let payload = {
      name: packageData.id,
      lead: leadData.name,
      discountType: values.discountType,
      discountPercentage: Math.round(values.discountPercentage),
      discountSource: values.campaignName,
      remark: comment,
      paymentOption:
        values.paymentOption === 'DIRECT_DEBIT_INSTALLMENT'
          ? 'RABBIT_CARE_INSTALLMENT'
          : values.paymentOption,
      paymentMethod: values.paymentMethod,
      cardProvider: values.cardProvider,
      numberOfInstallments: values.numberOfInstallment,
      insuranceKind: packageData?.insuranceKind?.toUpperCase() ?? null,
      documents: undefined as undefined | { name: string; label: string }[],
      deliveryOption: values.deliveryOption,
    };
    if (isEnableVoucherFlag && isMotorProduct) {
      payload = updateEligibleVoucherInformation(
        payload,
        voucherEligibility,
        isVoucherEligible
      );
    }
    if (files) {
      const documentResources = await uploadDocument(files);

      if (documentResources) {
        payload.documents = documentResources;
      } else {
        showErrorSnackbar(getString('text.uploadFailed'));
        newrelic?.noticeError?.(
          'Error while uploading discount request document'
        );
      }
    }

    const res = await updatePackage({
      packageId: packageData.id,
      payload,
    });

    if ('data' in res && isPackageSelected) {
      await resetCheckout();
    }
    return res;
  };

  const onSubmit = async (values: Form, comment?: string, files?: File[]) => {
    const response = await (
      packageData.packageSource === 'custom'
        ? updateCustomPackage
        : createCustomPackage
    )(values, comment, files);
    if ('error' in response) {
      if (response.error) {
        handleErrors(response.error);
        newrelic?.noticeError?.(response.error as any);
      }
    } else if (
      packageData.packageSource === 'custom' ||
      packageData?.customPackageResourceName
    ) {
      onClose();
    }
    setOpenedPackage?.([]);
    if (setExpendedPackage) setExpendedPackage(null);
    return response;
  };

  const {
    getPaymentOptions,
    data: paymentOptions,
    status,
  } = usePaymentInformation();

  const formik = useFormik<Form>({
    initialValues: {
      discountType: '',
      campaignName: undefined,
      paymentMethod: '',
      paymentOption: '',
      discountPercentage: 0,
      numberOfInstallment: 0,
      addOn: [],
      deliveryOption:
        packageData.packageSource !== 'custom'
          ? (ShipmentProviders.COURIER_PROVIDER_KERRY as string)
          : undefined,
    },
    validateOnMount: true,
    onSubmit: async (values) => {
      if (
        checkRequireDiscountRequest({
          discountType: values.discountType ?? '',
          maxDiscount: discountRef.current?.maxDiscount ?? 0,
          approver: discountRef.current?.approver ?? '',
          requestedDiscount: values.discountPercentage,
        })
      ) {
        setOpenCommentModal(true);
      } else {
        await onSubmit(values);
      }
    },
    validationSchema,
  });

  const resetPaymentInfo = () => {
    formik.setValues({
      ...formik.values,
      discountType: '',
      campaignName: undefined,
      paymentOption: '',
      paymentMethod: '',
      numberOfInstallment: 0,
      cardProvider: '',
      discountPercentage: 0,
    });
  };

  useEffect(() => {
    if (isEnableVoucherFlag && isMotorProduct) {
      const isCustomPackage = packageData?.packageSource === 'custom';
      if (isCustomPackage && !formik.dirty) {
        return;
      }
      getVoucher({
        packageId: packageData?.id || packageData?.name,
        lead: leadData?.name,
        numberOfInstallments:
          isCustomPackage && !formik.dirty
            ? packageData?.customQuoteDetail?.numberOfInstallments
            : formik.values.numberOfInstallment,
        discountPercentage:
          isCustomPackage && !formik.dirty
            ? satangToBaht(packageData?.customQuoteDetail?.discount?.percentage)
            : formik.values.discountPercentage,
      }).then((response: any) => {
        if ('error' in response) {
          handleErrors(response?.error);
          newrelic?.noticeError?.(response?.error);
          return;
        }
        if (!response.data) return;
        const { eligible, totalValue } = response.data;

        // When opening a custom package initially (formik not dirty yet), hydrate from server's saved voucherEligibility.
        // After user changes discount or installments (formik becomes dirty), always use latest API eligibility.
        const isInitialCustomPackageLoad = isCustomPackage && !formik.dirty;
        if (isInitialCustomPackageLoad) {
          getCustomPackage({
            packageId: packageData.id || packageData.name,
          }).then((customQuoteResponse: any) => {
            if (customQuoteResponse?.data?.voucherEligibility !== null) {
              setIsVoucherEligible(
                customQuoteResponse?.data?.voucherEligibility?.eligible
              );
            } else {
              // Fallback to current API eligibility if server has none.
              setIsVoucherEligible(eligible);
            }
          });
        } else {
          // Always reflect current API response. If API returns eligible=false we must uncheck.
          setIsVoucherEligible(eligible);
        }

        // Disable checkbox if not eligible; keep amount synced.
        setIsEnabledVoucher(eligible);
        setVoucherAmount(eligible ? satangToBaht(totalValue?.units) : 0);
      });
    }
  }, [formik.values.discountPercentage, formik.values.numberOfInstallment]);

  useEffect(() => {
    if (packageData.packageSource === 'custom') {
      formik.setValues({
        discountType: packageData.customQuoteDetail?.discountType,
        paymentMethod: packageData.customQuoteDetail?.paymentMethod ?? '',
        paymentOption: packageData.customQuoteDetail?.paymentOption ?? '',
        discountPercentage:
          packageData.customQuoteDetail?.discount?.percentage ?? 0,
        numberOfInstallment:
          packageData.customQuoteDetail?.numberOfInstallments ?? 0,
        cardProvider: packageData.customQuoteDetail?.cardProvider,
        campaignName: packageData.customQuoteDetail?.discountRequest?.source,
        deliveryOption: packageData.customQuoteDetail?.deliveryOption,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageData]);

  const { fullPayment, creditCardInstallment, rabbitCareInstallment } =
    paymentOptions;

  const handleVoucherChange = () => {
    setIsVoucherEligible((prev) => !prev);
  };

  return (
    <div>
      <FormikProvider value={formik}>
        <AddonAndShipping
          showAddon={packageData.insuranceKind !== 'mandatory'}
          selectedAddon={formik.values.addOn ?? []}
          handleAddonSelect={(val) => formik.setFieldValue('addOn', val)}
          deliveryOption={formik.values.deliveryOption ?? ''}
          handleDeliveryOptionChange={(val: string) =>
            formik.setFieldValue('deliveryOption', val)
          }
          policyType={leadData?.data?.policyHolderType}
          insuranceKind={packageData.insuranceKind}
          insurerName={
            packageData?.insuranceCompany?.name ||
            packageData?.insuranceCompany?.displayName
          }
        />
        <Form data-testid="discount-and-payment">
          <DiscountSection
            onClose={onClose}
            leadData={leadData}
            packageData={packageData}
            getPaymentOptions={getPaymentOptions}
            setCampaignName={(val: string) =>
              formik.setFieldValue('campaignName', val)
            }
            showPricing={(value: boolean) => setShowPricing(value)}
            resetForm={resetPaymentInfo}
            ref={discountRef}
          />
          <Divider pattern="dash" />
          {status?.isFetching && <SkeletonRow rows={5} />}
          {!!(fullPayment || creditCardInstallment || rabbitCareInstallment) &&
            showPricing && <PricingSection pricingData={paymentOptions} />}
          {isEnableVoucherFlag && isMotorProduct && (
            <div
              className="inline-flex flex-row items-center px-4 pb-4"
              data-testid="voucher-section"
            >
              <span className="text-primary font-bold text-base pr-2 whitespace-nowrap">
                {getString('voucher.label')}
              </span>
              <Checkbox
                label={
                  isVoucherLoading
                    ? getString('text.loading')
                    : `${voucherAmount} ${getString('voucher.partner')}`
                }
                color="primary"
                className="bg-gray-100 rounded-lg px-2"
                checked={isVoucherEligible}
                onChange={handleVoucherChange}
                disabled={!isEnabledVoucher}
                id="data-checkbox-voucher"
              />
            </div>
          )}
          <div className="flex items-center justify-center pb-[15px]">
            <Button
              type="submit"
              text={getString('discountPricing.submit')}
              className="flex items-center justify-center h-[40px] min-w-[215px]"
              disabled={!formik.isValid || !showPricing || disable}
              isLoading={formik.isSubmitting}
            />
          </div>
        </Form>
      </FormikProvider>
      {isCommentModalOpen && (
        <CommentModal
          disable={disable}
          isOpen={isCommentModalOpen}
          isDocumentOptional={
            formik.values.discountType !== DiscountType.matchPrice
          }
          onClose={() => setOpenCommentModal(false)}
          onSubmit={(comment, files) => onSubmit(formik.values, comment, files)}
          dataTestId="discount-approval-comment-modal"
        />
      )}
    </div>
  );
}

export default DiscountAndPayment;
