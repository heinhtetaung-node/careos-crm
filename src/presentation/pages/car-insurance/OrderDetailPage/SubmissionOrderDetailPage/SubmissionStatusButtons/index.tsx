import { CheckRounded } from '@material-ui/icons';
import _get from 'lodash/get';
import React from 'react';

import { useUpdateSubmissionMutation } from 'data/slices/submissionSlice';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import Dialog, { IDialogProps } from 'presentation/components/common/Dialog';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { getString } from 'presentation/theme/localization';
import { ItemSubmissionStatus, ItemQcStatus } from 'shared/constants/orderType';
import useSnackbar from 'utils/snackbar';

import SubmissionStatusForm from './SubmissionStatusForm';

interface SubmissionStatusButtonsProps {
  policy: any;
  orderId: string;
}

interface StatusUpdateButtonProps {
  handleSubmisionAction: () => void;
  statusBtnDisabled: boolean;
}

function StatusUpdateButton({
  handleSubmisionAction,
  statusBtnDisabled = false,
}: Readonly<StatusUpdateButtonProps>) {
  return (
    <CommonButton
      data-testid="btn-update-submission"
      variant="contained"
      color="success"
      startIcon={<CheckRounded />}
      onClick={handleSubmisionAction}
      disabled={statusBtnDisabled}
    >
      {getString('text.updateStatus')}
    </CommonButton>
  );
}

function SubmissionStatusButtons({
  policy,
  orderId,
}: Readonly<SubmissionStatusButtonsProps>) {
  const [statusBtnDisabled, setStatusBtnDisabled] = React.useState(false);
  const [openCommentDialog, setOpenCommentDialog] = React.useState(false);
  const [dialogProps, setDialogProps] = React.useState<
    Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
  >();
  const [submissionStatus, setSubmissionStatus] = React.useState<
    ItemSubmissionStatus | 'ITEM_SUBMISSION_STATUS_UNSPECIFIED'
  >(policy.submissionStatus);
  const [statusForUpdate, setStatusForUpdate] = React.useState<
    ItemSubmissionStatus | 'ITEM_SUBMISSION_STATUS_UNSPECIFIED'
  >(ItemSubmissionStatus.SUBMITTED);

  const [updateSubmission, { isUninitialized, isSuccess, error }] =
    useUpdateSubmissionMutation();
  const [addAndGetComment] = useOrderComments();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const handleSubmit = (action: any) => {
    setStatusBtnDisabled(true);
    setStatusForUpdate(action?.status);
    updateSubmission({
      orderId: policy?.name,
      payload: {
        status: action?.status,
      },
    });
    addAndGetComment(
      {
        createBy: '',
        text: action?.comment,
        orderId,
      },
      orderId
    );
    setOpenCommentDialog(false);
  };

  React.useEffect(() => {
    setStatusBtnDisabled(false);
    if (!isUninitialized && error) {
      const errMsg = _get(error, 'data.message', '');
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: errMsg,
        })
      );
    } else if (!isUninitialized && isSuccess) {
      setSubmissionStatus(statusForUpdate);
      showSuccessSnackbar(getString('text.updatePolicySuccessfully'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, isSuccess, error]);

  const handleDialogToggle = () => {
    setOpenCommentDialog((prev) => !prev);
  };

  const handleSubmisionAction = () => {
    handleDialogToggle();
  };

  const qcSubmissionStatus = policy.qcStatus;
  const isSubmit =
    submissionStatus !== ItemSubmissionStatus.SUBMITTED &&
    submissionStatus !== ItemSubmissionStatus.PRESUBMITTED &&
    qcSubmissionStatus === ItemQcStatus.APPROVED;

  const isPreSubmit =
    submissionStatus !== ItemSubmissionStatus.SUBMITTED &&
    submissionStatus !== ItemSubmissionStatus.PRESUBMITTED &&
    qcSubmissionStatus === ItemQcStatus.PREAPPROVED;

  const isPreSubmitted = submissionStatus === ItemSubmissionStatus.PRESUBMITTED;
  const isReadyToSubmit =
    submissionStatus === ItemSubmissionStatus.READY_TO_SUBMIT;
  const isQcApproved = qcSubmissionStatus === ItemQcStatus.APPROVED;
  const isSubmitted = submissionStatus === ItemSubmissionStatus.SUBMITTED;
  const isUnknown =
    (submissionStatus === ItemSubmissionStatus.PENDING ||
      submissionStatus === 'ITEM_SUBMISSION_STATUS_UNSPECIFIED') &&
    (qcSubmissionStatus === ItemQcStatus.PENDING ||
      qcSubmissionStatus === 'QC_SUBMISSION_STATUS_UNSPECIFIED');

  return (
    <>
      {isReadyToSubmit && (
        <CommonButton
          variant="text"
          color="default"
          disabled
          startIcon={<CheckRounded />}
          data-testid="btn-submitted-submission"
        >
          {getString('submissionStatus.readyToSubmit')}
        </CommonButton>
      )}

      {(isSubmit || isPreSubmit) && (
        <StatusUpdateButton
          handleSubmisionAction={handleSubmisionAction}
          statusBtnDisabled={statusBtnDisabled || policy.isCancelled}
        />
      )}

      {isPreSubmitted && (
        <>
          <CommonButton
            variant="text"
            color="default"
            disabled
            startIcon={<CheckRounded />}
            data-testid="btn-presubmitted-submission"
          >
            {getString('submissionStatus.preSubmit')}
          </CommonButton>
          {isQcApproved && (
            <StatusUpdateButton
              handleSubmisionAction={handleSubmisionAction}
              statusBtnDisabled={statusBtnDisabled}
            />
          )}
        </>
      )}

      {isSubmitted && (
        <CommonButton
          variant="text"
          color="default"
          disabled
          startIcon={<CheckRounded />}
          data-testid="btn-submitted-submission"
        >
          {getString('submissionStatus.submitted')}
        </CommonButton>
      )}

      {isUnknown && (
        <CommonButton
          variant="contained"
          color="success"
          disabled
          startIcon={<CheckRounded />}
        >
          {getString('text.updateStatus')}
        </CommonButton>
      )}
      <Dialog
        open={openCommentDialog}
        formId="update-submission-comment"
        content={
          <SubmissionStatusForm
            onSubmit={handleSubmit}
            setDialogProps={setDialogProps}
            submissionStatus={submissionStatus}
            isQcApproved={isQcApproved}
          />
        }
        showButton
        buttonText={getString('text.save')}
        buttonProps={{ disabled: true }}
        title={getString('text.updateStatus')}
        handleToggle={handleDialogToggle}
        {...dialogProps}
      />
    </>
  );
}

export default SubmissionStatusButtons;
