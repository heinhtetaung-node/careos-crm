import React, { PropsWithChildren, useEffect, useState } from 'react';
import clsx from 'clsx';
import { getString } from './theme/localization';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog, { IDialogProps } from 'presentation/components/common/Dialog';
import SubmissionStatusForm from './pages/car-insurance/OrderDetailPage/SubmissionOrderDetailPage/SubmissionStatusButtons/SubmissionStatusForm';
import { useUpdateSubmissionMutation } from 'data/slices/submissionSlice';
import useOrderComments from './hooks/useOrderComments';
import { ItemApprovalStatus, ItemQcStatus } from 'shared/constants/orderType';
import { useUpdatePolicyApprovalStatusMutation } from 'data/slices/orderPolicySlice';
import { useLazyGetPolicyDocsQuery } from 'data/slices/policyDocsSlice';
import ShipmentHelper from './components/ActivityOrderSection/helper';
import useSnackbar from 'utils/snackbar';
import { useFormik } from 'formik';
import CommonTextField from './components/common/CommonTextField/CommonTextField';
import Autocomplete from 'presentation/components/common/Autocomplete';
import {
  ConfirmAction,
  statusOptions,
} from './pages/car-insurance/OrderDetailPage/ApprovalOrderDetailPage/ApprovalStatusButtons';
import CommonButton from 'presentation/components/common/Button/CommonButton';

export default function QcTab({
  policy,
  uploadedDocuments,
  isSaleAgent,
  refetchPolicyItems,
}: PropsWithChildren<{
  policy: any;
  uploadedDocuments: { type: string; name: string }[];
  isSaleAgent?: boolean;
  refetchPolicyItems: () => Promise<any> | void;
}>) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openCommentDialog, setOpenCommentDialog] = React.useState(false);
  const [
    updateSubmission,
    { isSuccess: isSubmissionSuccess, isError: isSubmissionError },
  ] = useUpdateSubmissionMutation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [
    updateApprovalStatus,
    { isSuccess: isApprovalSuccess, isError: isApprovalError },
  ] = useUpdatePolicyApprovalStatusMutation();

  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(
    ConfirmAction.insurerApproved
  );

  const [getPolicyDocs] = useLazyGetPolicyDocsQuery();
  const [addAndGetComment] = useOrderComments();
  const [dialogProps, setDialogProps] = React.useState<
    Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
  >();
  const [dialogToggle, setDialogToggle] = useState(false);
  const qcSubmissionStatus = policy?.qcStatus;

  const isQcApproved = qcSubmissionStatus === ItemQcStatus.APPROVED;
  const isSubmissionSubmitted =
    policy?.submissionStatus === 'ITEM_SUBMISSION_STATUS_SUBMITTED';

  const getActiveQCStatus = () => {
    switch (policy?.qcStatus) {
      case 'ITEM_QC_STATUS_PENDING':
        return 0;
      case 'ITEM_QC_STATUS_APPROVED':
        return isSubmissionSubmitted ? 2 : 1;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (isSubmissionSuccess || isApprovalSuccess) {
      refetchPolicyItems();
      showSuccessSnackbar(getString('tableListing.orderUpdated'));
    }
    if (isSubmissionError || isApprovalError) {
      showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
    }
  }, [
    isSubmissionSuccess,
    isApprovalSuccess,
    isSubmissionError,
    isApprovalError,
  ]);

  const orderId = policy?.name?.split('/')[1];

  const checkValidationAndOpenDialog = async (step: number) => {
    const policyItemsResponse = await Promise.resolve(refetchPolicyItems());
    const refreshedPolicy =
      policyItemsResponse?.data?.find(
        (item: any) => item?.name === policy?.name
      ) ?? policy;

    const res = await getPolicyDocs({
      orderId,
      policyId: ShipmentHelper.getPolicyIdFromName(policy?.name),
    });
    const documents = res?.data?.documents ?? [];

    const policyPdfUploaded =
      documents?.find((doc: any) => doc?.type === 'DOCUMENT_TYPE_POLICY')
        ?.name !== undefined;
    const idUploaded =
      uploadedDocuments?.find(
        (doc: any) => doc?.type === 'DOCUMENT_TYPE_ID_CARD'
      )?.name !== undefined;

    if (step === 3) {
      if (refreshedPolicy?.policyNumber && idUploaded && policyPdfUploaded) {
        setConfirmDialog(true);
        setConfirmAction(ConfirmAction.policyUploaded);
      } else {
        showErrorSnackbar(
          getString(`healthOrder.submissionValidationErrorStep${step}`)
        );
      }
    } else {
      setOpenCommentDialog(true);
    }
  };

  const handleClick = (index: number) => {
    switch (index) {
      case 0:
        navigate(pathname.replace('orders/', 'orders/qc/'));
        break;
      case 1:
        checkValidationAndOpenDialog(1);
        break;
      case 2:
        checkValidationAndOpenDialog(2);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (action: any) => {
    if (
      [
        'ITEM_APPROVAL_STATUS_APPROVED',
        'ITEM_APPROVAL_STATUS_REJECTED',
        'ITEM_APPROVAL_STATUS_PENDING',
      ].includes(action?.status)
    ) {
      await updateApprovalStatus({
        name: policy?.name,
        status: action?.status,
      });
    } else {
      await updateSubmission({
        orderId: policy?.name,
        payload: {
          status: action?.status,
        },
      });
    }
    await addAndGetComment(
      {
        createBy: '',
        text: action?.comment,
        orderId: policy?.name?.split('/')?.[1],
      },
      policy?.name?.split('/')?.[1]
    );
    setOpenCommentDialog(false);
  };
  const isApproved = policy?.approvalStatus === 'ITEM_APPROVAL_STATUS_APPROVED';
  const isRejected = policy?.approvalStatus === 'ITEM_APPROVAL_STATUS_REJECTED';
  const isSubmissionProblem =
    policy?.approvalStatus === 'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM';
  const isPolicyUploaded =
    policy?.approvalStatus === 'ITEM_APPROVAL_STATUS_POLICY_UPLOADED';

  const qcStatusList = [
    isQcApproved ? 'healthOrder.passedQc' : 'healthOrder.pendingQc',
    isSubmissionSubmitted
      ? 'healthOrder.passedSubmission'
      : 'healthOrder.pendingSubmission',
    'healthOrder.pendingApprove',
  ];

  const handleRejectReason = () => {
    setOpenCommentDialog(false);
    setDialogToggle(true);
  };

  const handleApproved = async () => {
    await updateApprovalStatus({
      name: policy?.name,
      status: ItemApprovalStatus.APPROVED,
    });
  };

  const handlePending = async () => {
    await updateApprovalStatus({
      name: policy?.name,
      status: ItemApprovalStatus.PENDING,
    });
  };

  const handlePolicyUploaded = async () => {
    await updateApprovalStatus({
      name: policy?.name,
      status: ItemApprovalStatus.POLICY_UPLOADED,
    });
  };

  const handleConfirm = () => {
    switch (confirmAction) {
      case ConfirmAction.insurerApproved:
        handleApproved();
        break;
      case ConfirmAction.policyUploaded:
        handlePolicyUploaded();
        break;
      case ConfirmAction.issuesFixed:
        handlePending();
        break;
      default:
    }
    setConfirmDialog(false);
  };

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

  const formik = useFormik({
    onSubmit: async (values) => {
      const comment = `${values.status.title}-${values.comment}`;
      const status = values.status.value as string;
      await Promise.all([
        addAndGetComment(
          {
            createBy: '',
            text: comment,
            orderId,
          },
          orderId
        ),
        updateApprovalStatus({ name: policy?.name, status }),
      ]);
      setDialogToggle(false);
    },
    initialValues: {
      status: statusOptions[0],
      comment: '',
    },
  });

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

  const getStatusDisplayText = (isActive: boolean, status: string) => {
    if (!isActive) {
      return getString(status);
    }

    if (isApproved) {
      return (
        <button
          type="button"
          onClick={() => (!isSaleAgent ? checkValidationAndOpenDialog(3) : {})}
          className="w-full h-full bg-inherit cursor-pointer text-[14px] font-bold text-white"
          color="success"
        >
          {getString('approveStatus.policyUpload')}
        </button>
      );
    }

    if (isRejected) {
      return getString('approvalStatusOptions.rejected');
    }

    if (isSubmissionProblem) {
      return getString('approvalStatusOptions.submissionProblem');
    }

    if (isPolicyUploaded) {
      return getString('approveStatus.policyUploaded');
    }

    return getString(status);
  };

  return (
    <div className="w-full flex">
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
        open={openCommentDialog}
        formId="update-submission-comment"
        content={
          <SubmissionStatusForm
            onSubmit={handleSubmit}
            setDialogProps={setDialogProps}
            submissionStatus={policy?.submissionStatus}
            isQcApproved={isQcApproved}
            handleRejectReason={handleRejectReason}
          />
        }
        showButton
        buttonText={getString('text.save')}
        buttonProps={{ disabled: true }}
        title={getString('text.updateStatus')}
        handleToggle={() => setOpenCommentDialog((prev) => !prev)}
        {...dialogProps}
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
      {qcStatusList.map((status, index) => {
        const isActive =
          getActiveQCStatus() === index &&
          policy?.documentStatus === 'ITEM_DOCUMENT_STATUS_COMPLETE'; // only allow to click QC tab only when document status is complete, !important fix later after pre approved done
        return (
          <button
            type="button"
            key={status}
            className={clsx(
              'w-1/3 text-center bg-gray-200 flex justify-center h-12 items-center',
              isActive && 'bg-primary text-white cursor-pointer',
              isActive &&
                // (isApproved || isPolicyUploaded) &&
                isPolicyUploaded &&
                '!bg-green-500 text-white cursor-pointer',
              isActive &&
                (isRejected || isSubmissionProblem) &&
                '!bg-red-500 text-white cursor-pointer'
            )}
            onClick={() =>
              isActive && !isApproved && !isPolicyUploaded && !isSaleAgent
                ? handleClick(index)
                : {}
            }
          >
            <div className="text-[14px] font-bold w-full h-full flex items-center justify-center">
              {getStatusDisplayText(isActive, status)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
