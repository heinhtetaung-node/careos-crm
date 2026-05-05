import { WarningIcon } from '@alphafounders/icons';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { UserRoles } from 'config/constant';
import FeatureFlags from 'config/flagsmithConfig';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetCustomPackageByIdQuery } from 'data/slices/customQuoteSlice';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useGetTransactionByIdQuery } from 'data/slices/transactionSlice';
import { useFlags } from 'flagsmith/react';
import Controls from 'presentation/components/controls/Control';
import CouponModal from 'presentation/components/modal/LeadDetailsModal/CouponModal';
import WarningModal from 'presentation/components/modal/WarningModal';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';
import { satangToBaht } from 'utils/currency';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';
import { array, number, object, string } from 'yup';

import InsurerInfoBtn from 'presentation/components/InsureInfoButton';
import CommonModal from 'presentation/components/modal/CommonModal';
import ViewPurchaseButton from 'presentation/components/ViewPurchaseButton';

import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import 'presentation/components/InsurerInfoSection/index.scss';
import ApplicationFormModal from 'presentation/components/modal/LeadDetailsModal/ApplicationFormModal';
import { hasPackageSearchRequiredFields } from '../../helper';

interface ButtonsSectionProps {
  onRequestQuote: () => void;
  isFieldDisabled?: boolean;
}

function ButtonsSection({
  isFieldDisabled = false,
}: Readonly<ButtonsSectionProps>) {
  const navigate = useNavigate();
  const { errors, setFieldTouch } = useLeadDetailError();
  const flags = useFlags([
    FeatureFlags.BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP,
    FeatureFlags.BROK_2243_ENABLE_AUTO_FILL_APPLICATION_FORM_HEALTH_20250423,
  ]);

  const enableHealthPaymentFlow =
    flags[FeatureFlags.BROK_1138_SHOW_PAYMENT_FLOW_FOR_HEALTH_20241210_TEMP]
      ?.enabled;

  const enableAutoFillApplicationForm =
    flags[
      FeatureFlags.BROK_2243_ENABLE_AUTO_FILL_APPLICATION_FORM_HEALTH_20250423
    ]?.enabled;

  const { data: user } = useGetAuthenticateQuery();
  const userAuthRole = user?.role as UserRoles;

  const { viewSelectedPackage, canCreatePayment, canCreateContract } =
    getUserRoleAccessLead(userAuthRole);
  const leadInfo = useGetLeadSelector();

  const { data: packageDetails } = useGetCustomPackageByIdQuery(
    leadInfo?.data?.checkout?.package
      ? {
          packageId: leadInfo?.data?.checkout?.package,
          product: leadInfo.product,
        }
      : skipToken
  );

  const hasRequiredFields = useMemo(() => {
    if (leadInfo?.data) {
      return hasPackageSearchRequiredFields(leadInfo.data);
    }
    return false;
  }, [leadInfo]);

  const leadStatus = useMemo(() => {
    if (leadInfo) {
      return leadInfo.status;
    }
    return undefined;
  }, [leadInfo]);

  const packageId = useMemo(() => {
    if (leadInfo?.data) {
      return leadInfo.data?.checkout?.package;
    }
    return undefined;
  }, [leadInfo]);

  const { data: selectedPackage } = useGetSelectedPackageQuery({
    leadId: getLeadIdFromLeadName(leadInfo.name),
    enableDiscountPricing: true,
  });

  const isValidInsurer = useMemo(() => {
    const careOsInsurerIds = [
      'insurers/7',
      'insurers/34',
      'insurers/27',
      'insurers/30',
    ];
    return (
      selectedPackage &&
      careOsInsurerIds.includes(
        selectedPackage.healthPackage?.package?.insurerDetails
          ?.careOsInsurerId || ''
      )
    );
  }, [selectedPackage]);

  const isValidPreferredProductCategory = useMemo(() => {
    const careOsProductCategory = ['ipdOpd', 'disease'];
    return (
      leadInfo &&
      careOsProductCategory.includes(leadInfo.data?.insurance?.category || '')
    );
  }, [leadInfo]);

  const [isOpenCouponModal, setIsOpenCouponModal] = useState(false);
  const [openValidationPopup, setOpenValidationPopup] = useState(false);
  const [isOpenAppForm, setIsOpenAppForm] = useState(false);

  const disableCreatePayment = useMemo(
    () =>
      leadStatus == null ||
      leadInfo.isRejected ||
      leadStatus === 'LEAD_STATUS_CANCELLED' ||
      leadStatus === 'LEAD_STATUS_PURCHASED' ||
      leadStatus === 'LEAD_STATUS_PAID_ONLINE' ||
      leadInfo.data == null ||
      leadInfo.data.checkout == null ||
      leadInfo.data.customerFirstName == null ||
      leadInfo.data.customerLastName == null ||
      leadInfo.data.customerFirstName === '' ||
      leadInfo.data.customerLastName === '' ||
      leadInfo.data.checkout.package == null ||
      !leadInfo?.data?.checkout?.paymentOption?.length ||
      !leadInfo?.data?.checkout?.paymentMethod?.length,
    [leadInfo, leadStatus]
  );
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { data: paymentDetails } = useGetTransactionByIdQuery(
    packageDetails?.priceResourceName
      ? { paymentId: packageDetails?.priceResourceName, product: globalProduct }
      : skipToken
  );

  const disableCreateContract = useMemo(() => {
    const validationSchema = object({
      // insuranceKind: string().required().notOneOf(['mandatory']),
      customerEmail: array().min(1).required().of(string()),
      policyStartDate: string().required(),
      customerPhoneNumber: array()
        .required()
        .min(1)
        .of(
          object().shape({
            phone: string().required(),
            status: string().required(),
          })
        ),
      packagePrice: number().required().moreThan(0),
      policyHolderType: string()
        .required()
        .oneOf(['customer', 'company', 'straw_buyer']),
      policyHolderNationalId: string().when(
        'policyHolderType',
        ([policyHolderType], schema) =>
          policyHolderType === 'company' ? schema.optional() : schema.required()
      ),
      customerPolicyAddress: array()
        .required()
        .min(1)
        .when('policyHolderType', ([policyHolderType], schema) =>
          schema.of(
            object().shape({
              addressType: string()
                .required()
                .oneOf(['personal', 'company', 'other']),
              firstName:
                policyHolderType === 'company'
                  ? string().optional()
                  : string().required(),
              lastName:
                policyHolderType === 'company'
                  ? string().optional()
                  : string().required(),
              companyName:
                policyHolderType === 'company'
                  ? string().required()
                  : string().optional(),
              taxId:
                policyHolderType === 'company'
                  ? string().required()
                  : string().optional(),
              address: string().required(),
              province: number().required().moreThan(-1),
              district: number().required().moreThan(-1),
              subDistrict: number().required().moreThan(-1),
              postCode: number().required().moreThan(-1),
            })
          )
        ),
      paymentOption: string().required().equals(['RABBIT_CARE_INSTALLMENT']),
    });
    let isValid = true;
    try {
      validationSchema.validateSync({
        // insuranceKind: leadInfo.data.insuranceKind,
        customerEmail: leadInfo.data.customerEmail,
        policyStartDate: leadInfo.data.policyStartDate,
        policyHolderNationalId: leadInfo.data.policyHolderNationalId,
        customerPhoneNumber: leadInfo.data.customerPhoneNumber,
        customerPolicyAddress: leadInfo.data.customerPolicyAddress,
        policyHolderType: leadInfo.data.policyHolderType,
        packagePrice: satangToBaht(paymentDetails?.invoicePrice ?? ''),
        paymentOption: leadInfo.data.checkout?.paymentOption,
      });
    } catch (e) {
      console.log(e);

      isValid = false;
    }
    return !isValid || disableCreatePayment;
  }, [
    paymentDetails?.invoicePrice,
    disableCreatePayment,
    leadInfo.data.customerEmail,
    leadInfo.data.policyStartDate,
    leadInfo.data.policyHolderNationalId,
    leadInfo.data.customerPhoneNumber,
    leadInfo.data.customerPolicyAddress,
    leadInfo.data.policyHolderType,
    leadInfo.data.checkout?.paymentOption,
  ]);

  const onCreateContractPressed = () =>
    navigate(`/health/${leadInfo.name}/create-contract`);

  const onCreatePaymentPressed = () =>
    navigate(`/health/${leadInfo.name}/create-payment`);

  return (
    <>
      {viewSelectedPackage && (
        <div className="view-purchase shared-insurer-info__button">
          <ViewPurchaseButton
            packageId={packageId}
            tooltipKey={packageDetails?.displayName || null}
          />
        </div>
      )}
      <div className="view-purchase shared-insurer-info__button">
        <span>
          {hasRequiredFields ? (
            <InsurerInfoBtn
              isDisabled={isFieldDisabled || !leadInfo?.data?.policyHolder?.dob}
            />
          ) : (
            <Controls.Button
              color={errors.package ? 'danger' : 'primary'}
              data-testid="view-package-popup"
              className="button-view-quotes"
              onClick={() => {
                setFieldTouch('package');
                setOpenValidationPopup(true);
              }}
              disabled={isFieldDisabled}
            >
              {getString('text.viewPackages')}
            </Controls.Button>
          )}
        </span>
      </div>
      <div className="flex flex-nowrap px-[15px] gap-[10px]">
        <div className="add-coupon shared-insurer-info__button grow">
          <Controls.Button
            color="primary"
            onClick={onCreatePaymentPressed}
            data-testid="create-payment-button"
            disabled={
              disableCreatePayment || isFieldDisabled || !canCreatePayment
            }
          >
            {getString('text.createPayment')}
          </Controls.Button>
        </div>
        {enableHealthPaymentFlow && (
          <div className="add-coupon shared-insurer-info__button grow">
            <Controls.Button
              color="primary"
              onClick={onCreateContractPressed}
              data-testid="create-contract-button"
              disabled={
                disableCreateContract || isFieldDisabled || !canCreateContract
              }
            >
              {getString('text.createContract')}
            </Controls.Button>
          </div>
        )}
      </div>
      {enableAutoFillApplicationForm && (
        <div className="px-4 py-2">
          <Controls.Button
            color="primary"
            variant="contained"
            className="button-view-quotes w-full"
            onClick={() => setIsOpenAppForm(true)}
            disabled={
              !packageDetails ||
              !isValidInsurer ||
              !isValidPreferredProductCategory
            }
          >
            {getString('text.createApplicationForm')}
          </Controls.Button>
        </div>
      )}
      <CommonModal
        title={getString('text.addCoupon')}
        open={isOpenCouponModal}
        handleCloseModal={() => setIsOpenCouponModal(false)}
      >
        <CouponModal
          close={() => setIsOpenCouponModal(false)}
          leadStatus={leadStatus as string}
        />
      </CommonModal>
      <CommonModal
        open={openValidationPopup}
        handleCloseModal={() => setOpenValidationPopup(false)}
        hasBorderRadius
      >
        <WarningModal
          logo={<WarningIcon viewBox="0 0 60 60" />}
          title={getString('warningModal.warning')}
          description={
            <Trans
              defaults={getString('warningModal.completeMessageNew')}
              components={[<strong key="1" />]}
            />
          }
        />
      </CommonModal>
      <CommonModal
        title={getString('text.applicationFormPreview')}
        titleCenter
        maxWidth="lg"
        open={isOpenAppForm}
        handleCloseModal={() => setIsOpenAppForm(false)}
      >
        <ApplicationFormModal handleOnClose={() => setIsOpenAppForm(false)} />
      </CommonModal>
    </>
  );
}

export default ButtonsSection;
