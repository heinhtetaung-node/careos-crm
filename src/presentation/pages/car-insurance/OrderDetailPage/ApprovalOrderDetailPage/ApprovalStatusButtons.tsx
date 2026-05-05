import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import _get from 'lodash/get';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useFlags } from 'flagsmith/react';

import FeatureFlags from 'config/flagsmithConfig';
import { useUpdatePolicyApprovalStatusMutation } from 'data/slices/orderPolicySlice/index';
import {
  ShipmentMethodPayload,
  useCreateShipmentMutation,
} from 'data/slices/shipmentSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import Dialog from 'presentation/components/common/Dialog';
import { getErrorMsg } from 'presentation/components/Shipment/helper';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import {
  ItemApprovalStatus,
  ItemSubmissionStatus,
  ShipmentMethods,
  ShipmentProviders,
} from 'shared/constants/orderType';

type ApprovalStatusButtonsProps = {
  orderPolicy?: Record<string, any>;
  name: string; // policy name order/*/items/*
  isPolicyReady?: boolean;
  showApprovalStatusButtons?: boolean;
  approvalStatus: ItemApprovalStatus;
  submissionStatus: ItemSubmissionStatus;
  fieldsErrors?: Record<string, any>;
  disableDocumentSection?: () => void;
  isApprovalAgent?: boolean;
};

const textButtonText = {
  [ItemApprovalStatus.APPROVED]: getString(
    'approvalStatusButtons.insurerApproved'
  ),
  [ItemApprovalStatus.REJECTED]: getString(
    'approvalStatusButtons.insurerRejected'
  ),
  [ItemApprovalStatus.SUBMISSION_PROBLEM]: getString('text.submissionProblem'),
  [ItemApprovalStatus.POLICY_UPLOADED]: getString(
    'approveStatus.policyUploaded'
  ),
};

export const statusOptions = [
  {
    title: getString('text.remarks'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
  {
    title: getString('approvalStatusButtons.insurerRejected'),
    value: ItemApprovalStatus.REJECTED,
  },
  {
    title: getString('approvalStatusButtons.wrongPackageOrVehicle'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
  {
    title: getString('approvalStatusButtons.claimBeforeRenewal'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
  {
    title: getString('approvalStatusButtons.cannotInspectVehicle'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
  {
    title: getString('approvalStatusButtons.cannotTransferQuote'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
  {
    title: getString('text.other'),
    value: ItemApprovalStatus.SUBMISSION_PROBLEM,
  },
];

export enum ConfirmAction {
  insurerApproved = 'insurerApproved',
  policyUploaded = 'policyUploaded',
  issuesFixed = 'issuesFixed',
}

export default function ApprovalStatusButtons({
  orderPolicy,
  name,
  approvalStatus: astatus,
  submissionStatus: sstatus,
  isPolicyReady,
  fieldsErrors,
  disableDocumentSection,
  showApprovalStatusButtons = false,
  isApprovalAgent = false,
}: Readonly<ApprovalStatusButtonsProps>) {
  const [approvalStatus, setApprovalStatus] = useState(astatus);
  const [submissionStatus, setSubmissionStatus] = useState(sstatus);
  const [addAndGetComment] = useOrderComments();
  const [
    updateApprovalStatus,
    {
      isSuccess: isUpdateStatusSuccess,
      isError: isUpdateStatusError,
      error: statusError,
      data,
    },
  ] = useUpdatePolicyApprovalStatusMutation();
  const [dialogToggle, setDialogToggle] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(
    ConfirmAction.insurerApproved
  );
  const { policyNumber } = orderPolicy?.policy ?? '';

  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [createShipment, { isLoading: isCreatingShipment }] =
    useCreateShipmentMutation();

  const flags = useFlags([
    FeatureFlags.BROK_3788_ENABLE_DIGITAL_DELIVERY_SHIPMENT_ON_POLICY_APPROVAL_20250115_TEMP,
  ]);

  const isDigitalDeliveryShipmentEnabled =
    flags[
      FeatureFlags.BROK_3788_ENABLE_DIGITAL_DELIVERY_SHIPMENT_ON_POLICY_APPROVAL_20250115_TEMP
    ]?.enabled ?? false;

  const isDigitalDelivery =
    orderPolicy?.order?.data?.deliveryOption === ShipmentProviders.EMAIL;

  const isOrderCancelled = orderPolicy?.order?.isCancelled ?? false;
  // Enabled only when submission submitted and order not cancelled
  const statusBtnEnable =
    submissionStatus === ItemSubmissionStatus.SUBMITTED && !isOrderCancelled;

  const isPolicyNumberValid = policyNumber && policyNumber !== '';
  const isPolicyNumberValueValid = !fieldsErrors?.policyNumber;
  const policyUploadEnable =
    isPolicyReady && isPolicyNumberValid && isPolicyNumberValueValid;

  const showTextButton = approvalStatus !== ItemApprovalStatus.PENDING;

  const canUpdateUploadedPolicy =
    approvalStatus === ItemApprovalStatus.APPROVED;
  const submissionProblem =
    approvalStatus === ItemApprovalStatus.SUBMISSION_PROBLEM;

  const handleApproved = () => {
    updateApprovalStatus({
      name,
      status: ItemApprovalStatus.APPROVED,
    });
  };

  const handlePending = () => {
    updateApprovalStatus({
      name,
      status: ItemApprovalStatus.PENDING,
    });
  };

  const handlePolicyUploaded = async () => {
    await updateApprovalStatus({
      name,
      status: ItemApprovalStatus.POLICY_UPLOADED,
    });
    if (isDigitalDelivery && isDigitalDeliveryShipmentEnabled) {
      const orderIdFromPolicy = name.split('/items/')[0];
      const payload: ShipmentMethodPayload = {
        orderId: orderIdFromPolicy,
        payload: {
          shipmentMethod: ShipmentMethods.SHIPMENT_METHOD_DIGITAL,
          items: [name],
        },
      };
      try {
        await createShipment(payload).unwrap();
      } catch (error) {
        const errorResponse = _get(
          error,
          'data.message',
          getString('text.error')
        );
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getErrorMsg(errorResponse),
            status: CONSTANTS.snackBarConfig.type.error,
          })
        );
        return false;
      }
    }
    return true;
  };

  const handleConfirm = async () => {
    let shouldCloseDialog = true;
    switch (confirmAction) {
      case ConfirmAction.insurerApproved:
        handleApproved();
        break;
      case ConfirmAction.policyUploaded:
        shouldCloseDialog = await handlePolicyUploaded();
        break;
      case ConfirmAction.issuesFixed:
        handlePending();
        break;
      default:
    }
    if (shouldCloseDialog) {
      setConfirmDialog(false);
    }
  };

  const formik = useFormik({
    onSubmit: async (values) => {
      const comment = `${values.status.title}-${values.comment}`;
      const status = values.status.value;
      await Promise.all([
        addAndGetComment(
          {
            createBy: '',
            text: comment,
            orderId,
          },
          orderId
        ),
        updateApprovalStatus({ name, status }),
      ]);
      setDialogToggle(false);
    },
    initialValues: {
      status: statusOptions[0],
      comment: '',
    },
  });

  useEffect(() => {
    if (data) {
      const { approvalStatus: approval, submissionStatus: submission } = data;
      setApprovalStatus(approval);
      setSubmissionStatus(submission);
    }
  }, [data]);

  useEffect(() => {
    if (isUpdateStatusSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updatePolicySuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
      if (isApprovalAgent && confirmAction === ConfirmAction.policyUploaded) {
        disableDocumentSection?.();
      }
    } else if (isUpdateStatusError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.errorMessage', {
            message: (statusError as any)?.data?.message,
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  }, [isUpdateStatusError, isUpdateStatusSuccess, dispatch, statusError]);

  const renderStatusButtons = () => {
    if (showTextButton) {
      return (
        <>
          {submissionProblem && (
            <CommonButton
              data-testid="approval-issues-fixed-button"
              onClick={() => {
                setConfirmDialog(true);
                setConfirmAction(ConfirmAction.issuesFixed);
              }}
              className="ml-3"
              color="success"
              variant="contained"
              disabled={isOrderCancelled}
              startIcon={<CheckIcon />}
            >
              {getString('approvalStatusButtons.issuesFixed')}
            </CommonButton>
          )}
          <CommonButton
            data-testid="approval-text-button"
            color="default"
            disabled
            variant="text"
            startIcon={<CheckIcon />}
          >
            {textButtonText[approvalStatus]}
          </CommonButton>

          {canUpdateUploadedPolicy && (
            <CommonButton
              data-testid="approval-policy-uploaded-button"
              onClick={() => {
                setConfirmDialog(true);
                setConfirmAction(ConfirmAction.policyUploaded);
              }}
              className="ml-3"
              color="success"
              disabled={!policyUploadEnable || isOrderCancelled}
              variant="contained"
            >
              {getString('approveStatus.policyUploaded')}
            </CommonButton>
          )}
        </>
      );
    }
    if (showApprovalStatusButtons) {
      return (
        <>
          <CommonButton
            disabled={!statusBtnEnable}
            data-testid="approval-contain-button"
            className="mr-3"
            variant="contained"
            color="success"
            onClick={() => {
              setConfirmDialog(true);
              setConfirmAction(ConfirmAction.insurerApproved);
            }}
            startIcon={<CheckIcon />}
          >
            {getString('approvalStatusButtons.insurerApproved')}
          </CommonButton>
          <CommonButton
            data-testid="problem-contain-button"
            disabled={!statusBtnEnable}
            onClick={() => setDialogToggle(true)}
            variant="contained"
            color="danger"
            startIcon={<ClearIcon />}
          >
            {getString('approvalStatusButtons.problem')}
          </CommonButton>
        </>
      );
    }
    return null;
  };

  const Form = (
    <form
      id="approval-status-update-form"
      className="pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        formik.submitForm();
      }}
    >
      <Autocomplete
        options={statusOptions}
        className="mb-8"
        optionTextKey="title"
        textFieldProps={{
          label: getString('text.selectReason'),
          placeholder: getString('text.select'),
        }}
        onChange={(_e, val) => {
          formik.setFieldValue('status', val);
        }}
      />
      <CommonTextField
        label={getString('lead.comment')}
        dataTestId="problem-comment-textfield"
        value={formik.values.comment}
        minRows={4}
        multiline
        onChange={(e) => formik.setFieldValue('comment', e.target.value)}
      />
    </form>
  );

  const confirmMessage = () => {
    switch (confirmAction) {
      case ConfirmAction.insurerApproved:
        return getString('warningModal.approvalInsurerApproved');
      case ConfirmAction.policyUploaded:
        return getString('warningModal.approvalDocumentUploaded');
      case ConfirmAction.issuesFixed:
        return getString('warningModal.approvalIssueFixed');
      default:
    }
    return '';
  };

  return (
    <>
      {renderStatusButtons()}
      <Dialog
        open={dialogToggle}
        title={getString('approvalStatusButtons.problem')}
        color="warning"
        formId="approval-status-update-form"
        showButton
        handleToggle={() => setDialogToggle(false)}
        content={Form}
        buttonProps={{
          disabled: !formik.dirty,
        }}
        buttonText={getString('text.save')}
      />
      <Dialog
        open={confirmDialog}
        title={getString('warningModal.warning')}
        color="warning"
        handleToggle={() => setConfirmDialog(false)}
        content={<div className="text-center">{confirmMessage()}</div>}
        footerContent={
          <>
            <CommonButton
              onClick={handleConfirm}
              type="button"
              variant="contained"
              color="default"
            >
              {getString('text.confirmButton')}
            </CommonButton>
            <CommonButton
              onClick={() => setConfirmDialog(false)}
              type="button"
              variant="outlined"
              color="default"
            >
              {getString('text.cancelButton')}
            </CommonButton>
          </>
        }
      />
    </>
  );
}
