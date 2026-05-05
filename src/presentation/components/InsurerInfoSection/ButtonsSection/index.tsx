import { WarningIcon } from '@alphafounders/icons';
import { skipToken } from '@reduxjs/toolkit/query';
import { Form, Formik } from 'formik';
import React, { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { array, number, object, string } from 'yup';

import { UserRoles } from 'config/constant';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useGetCustomPackageByIdQuery } from 'data/slices/customQuoteSlice';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import useManualQuoteRestrictionByInsurerEnabled from 'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled';
import { useAddCommentMutation } from 'data/slices/leadDetails/commentsSlice';
import { useGetTransactionByIdQuery } from 'data/slices/transactionSlice';
import Controls from 'presentation/components/controls/Control';
import CouponModal from 'presentation/components/modal/LeadDetailsModal/CouponModal';
import WarningModal from 'presentation/components/modal/WarningModal';
import { hasPackageSearchRequiredFields } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';
import { satangToBaht } from 'utils/currency';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';

import InsurerInfoButton from '../../InsureInfoButton';
import CommonModal from '../../modal/CommonModal';
import ViewPurchaseButton from '../../ViewPurchaseButton';
import CouponTag from '../CouponTag';

import '../index.scss';
import useSnackbar from 'utils/snackbar';

interface ButtonsSectionProps {
  isFieldDisabled?: boolean;
}

function ButtonsSection({
  isFieldDisabled = false,
}: Readonly<ButtonsSectionProps>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { errors: leadDetailErrors, setFieldTouch } = useLeadDetailError();

  const { data: user } = useGetAuthenticateQuery();
  const userAuthRole = user?.role as UserRoles;

  const {
    viewSelectedPackage,
    canCreateCustomPackage,
    canCreateContract,
    canCreatePayment,
  } = getUserRoleAccessLead(userAuthRole);
  const leadInfo = useGetLeadSelector();

  const { data: packageDetails } = useGetCustomPackageByIdQuery(
    leadInfo?.data?.checkout?.package
      ? {
          packageId: leadInfo?.data?.checkout?.package,
          product: leadInfo.product,
        }
      : skipToken
  );

  const { data: paymentDetails } = useGetTransactionByIdQuery(
    packageDetails?.priceResourceName
      ? { paymentId: packageDetails?.priceResourceName }
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

  const [isOpenCouponModal, setIsOpenCouponModal] = useState(false);
  const [openValidationPopup, setOpenValidationPopup] = useState(false);
  const [isOpenRequestCustomPackageModal, setIsOpenRequestCustomPackageModal] =
    useState(false);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  const isManualQuoteRestrictionByInsurerEnabled =
    useManualQuoteRestrictionByInsurerEnabled();

  const disableCreatePayment = useMemo(
    () =>
      leadStatus === null ||
      leadInfo.isRejected ||
      leadStatus === 'LEAD_STATUS_CANCELLED' ||
      leadStatus === 'LEAD_STATUS_PURCHASED' ||
      leadStatus === 'LEAD_STATUS_PAID_ONLINE' ||
      leadInfo.data?.checkout === null ||
      leadInfo.data.customerFirstName === null ||
      leadInfo.data.customerLastName === null ||
      leadInfo.data.customerFirstName === '' ||
      leadInfo.data.customerLastName === '' ||
      leadInfo.data.checkout?.package === null ||
      !leadInfo?.data?.checkout?.paymentOption?.length ||
      !leadInfo?.data?.checkout?.paymentMethod?.length,
    [leadInfo, leadStatus]
  );

  const disableCreateContract = useMemo(() => {
    const validationSchema = object({
      insuranceKind: string().required().notOneOf(['mandatory']),
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
      policyHolderNationalId: string().when('policyHolderType', {
        is: 'company',
        then: () => string().optional(),
        otherwise: () => string().required(),
      }),
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
        insuranceKind: leadInfo.data.insuranceKind,
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
      console.log('e', e);
      isValid = false;
    }

    return !isValid || disableCreatePayment;
  }, [
    paymentDetails?.invoicePrice,
    disableCreatePayment,
    leadInfo.data.insuranceKind,
    leadInfo.data.customerEmail,
    leadInfo.data.policyStartDate,
    leadInfo.data.policyHolderNationalId,
    leadInfo.data.customerPhoneNumber,
    leadInfo.data.customerPolicyAddress,
    leadInfo.data.policyHolderType,
    leadInfo.data.checkout?.paymentOption,
  ]);

  const { showErrorSnackbar } = useSnackbar();

  const onCreatePaymentPressed = () => {
    if (
      !leadInfo?.data?.customerPhoneNumber?.[leadInfo.data.primaryPhoneIndex]
        ?.phone
    ) {
      showErrorSnackbar(getString('text.phoneNumberRequired'));
      return;
    }
    navigate(`/${leadInfo.name}/create-payment`);
  };

  const onCreateContractPressed = () =>
    navigate(`/${leadInfo.name}/create-contract`);

  const handleRequestCustomPackage = () => {
    if (isManualQuoteRestrictionByInsurerEnabled) {
      // If flag is on, navigate directly to custom-quote page
      navigate(`/${leadInfo.name}/custom-quote`);
    } else {
      // If flag is off, show modal to collect reason before navigating
      setIsOpenRequestCustomPackageModal(true);
    }
  };

  const handleSubmitRequestCustomPackage = async (reason: string) => {
    const leadId = getLeadIdFromLeadName(leadInfo.name);
    try {
      const commentText = `${getString('text.reasonManualPackage')}: ${reason.trim()}`;
      await addComment({
        text: commentText,
        leadId: `leads/${leadId}`,
      }).unwrap();
      setIsOpenRequestCustomPackageModal(false);
      // Show success message
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.reasonAddedSuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
      // Navigate to custom-quote page (create package page)
      navigate(`/${leadInfo.name}/custom-quote`);
    } catch (error) {
      console.error('Failed to create comment:', error);
      dispatch(
        showSnackBar({
          isOpen: true,
          message:
            getString('errorMessage.failedToAddReason') ||
            'Failed to add reason',
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  };

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
            <InsurerInfoButton isDisabled={isFieldDisabled} />
          ) : (
            <Controls.Button
              color={leadDetailErrors.package ? 'danger' : 'primary'}
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
      {canCreateCustomPackage && (
        <div className="flex flex-nowrap px-[15px] gap-[10px]">
          <div className="add-coupon shared-insurer-info__button grow">
            <CouponTag
              displayOnly
              couponCode={leadInfo.data?.checkout?.coupon ?? '-'}
              leadStatus={leadInfo.status}
              isFieldDisabled={isFieldDisabled}
            />
          </div>
          <div className="add-payslip shared-insurer-info__button grow">
            <Controls.Button
              color="primary"
              variant="contained"
              className="button-view-quotes"
              onClick={handleRequestCustomPackage}
              disabled={isFieldDisabled}
            >
              {getString('text.requestCustomPackage')}
            </Controls.Button>
          </div>
        </div>
      )}
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
      </div>
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
        title={getString('text.requestCustomPackage')}
        open={isOpenRequestCustomPackageModal}
        handleCloseModal={() => setIsOpenRequestCustomPackageModal(false)}
        maxWidth="sm"
      >
        <Formik
          initialValues={{ reason: '' }}
          validationSchema={Yup.object().shape({
            reason: Yup.string()
              .trim()
              .required(getString('errors.requiredField'))
              .min(
                10,
                getString('errors.minLength') ||
                  'Must be at least 10 characters'
              ),
          })}
          onSubmit={(values) => handleSubmitRequestCustomPackage(values.reason)}
        >
          {({
            values,
            errors,
            handleChange,
            handleSubmit: formikHandleSubmit,
            touched,
          }) => (
            <Form onSubmit={formikHandleSubmit}>
              <div className="p-[25px]">
                <div className="mb-[20px]   border-2 border-gray-300 rounded-md p-2 [&_.MuiInputBase-multiline]:!border [&_.MuiInputBase-multiline]:!border-gray-300 [&_.MuiInputBase-multiline]:!rounded-md [&_.MuiInputBase-multiline]:!p-2 [&_textarea]:!border [&_textarea]:!border-gray-300 [&_textarea]:!rounded-md [&_textarea]:!p-2">
                  <Controls.Input
                    name="reason"
                    label={`${getString('text.reasonManualPackage')}:`}
                    value={values.reason}
                    onChange={handleChange}
                    error={touched.reason ? errors.reason : ''}
                    rows={4}
                    multiline
                    data-testid="reason-textarea"
                  />
                </div>
                <div className="flex justify-end gap-[10px]">
                  <Controls.Button
                    color="secondary"
                    variant="text"
                    onClick={() => setIsOpenRequestCustomPackageModal(false)}
                    text={getString('text.cancelButton')}
                  />
                  <Controls.Button
                    type="submit"
                    color="primary"
                    disabled={
                      values.reason.trim().length < 10 ||
                      !!errors.reason ||
                      isAddingComment
                    }
                    text={
                      isAddingComment
                        ? getString('text.loading')
                        : getString('submissionStatus.submit')
                    }
                    data-testid="submit-request-custom-package"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CommonModal>
    </>
  );
}

export default ButtonsSection;
