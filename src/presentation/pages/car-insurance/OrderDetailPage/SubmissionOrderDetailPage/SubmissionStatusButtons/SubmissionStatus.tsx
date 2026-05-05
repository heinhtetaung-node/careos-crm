import { CheckRounded } from '@material-ui/icons';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useUpdateSubmissionMutation } from 'data/slices/submissionSlice';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import Dialog, { IDialogProps } from 'presentation/components/common/Dialog';
import CommentForm from 'presentation/components/QcDetailPage/QcStatusButtons/CommentForm';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { ItemSubmissionStatus, ItemQcStatus } from 'shared/constants/orderType';

interface SubmissionStatusProps {
  policy: any;
  orderId: string;
}

interface SubmitButtonProps {
  handleSubmisionAction: (action: ItemSubmissionStatus) => void;
  statusBtnDisabled: boolean;
}

function SubmitButton({
  handleSubmisionAction,
  statusBtnDisabled = false,
}: SubmitButtonProps) {
  return (
    <CommonButton
      data-testid="btn-submit-submission"
      variant="contained"
      color="success"
      startIcon={<CheckRounded />}
      onClick={() => handleSubmisionAction(ItemSubmissionStatus.SUBMITTED)}
      disabled={statusBtnDisabled}
    >
      {getString('submissionStatus.submit')}
    </CommonButton>
  );
}

function SubmissionStatus({ policy, orderId }: SubmissionStatusProps) {
  const [statusBtnDisabled, setStatusBtnDisabled] = React.useState(false);
  const [openCommentDialog, setOpenCommentDialog] = React.useState(false);
  const dispatch = useDispatch();
  const [dialogTitle, setDialogTitle] = React.useState('');
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
  const handleSubmit = (action: any) => {
    setStatusBtnDisabled(true);
    setSubmissionStatus(statusForUpdate);
    updateSubmission({
      orderId: policy?.name,
      payload: {
        status: statusForUpdate,
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
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.errorMessage', {
            message: error?.toString(),
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else if (!isUninitialized && isSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updatePolicySuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, isSuccess, error]);

  const handleDialogToggle = () => {
    setOpenCommentDialog((prev) => !prev);
  };

  const handleSubmisionAction = (action: ItemSubmissionStatus) => {
    if (action === ItemSubmissionStatus.SUBMITTED) {
      setDialogTitle('Submit');
    } else {
      setDialogTitle('Pre-submit');
    }
    setStatusForUpdate(action);
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
  const isQcApproved = qcSubmissionStatus === ItemQcStatus.APPROVED;

  const isSubmitted = submissionStatus === ItemSubmissionStatus.SUBMITTED;

  const isUnknown =
    (submissionStatus === ItemSubmissionStatus.PENDING ||
      submissionStatus === 'ITEM_SUBMISSION_STATUS_UNSPECIFIED') &&
    (qcSubmissionStatus === ItemQcStatus.PENDING ||
      qcSubmissionStatus === 'QC_SUBMISSION_STATUS_UNSPECIFIED');

  return (
    <>
      {isSubmit && (
        <SubmitButton
          handleSubmisionAction={handleSubmisionAction}
          statusBtnDisabled={statusBtnDisabled}
        />
      )}

      {isPreSubmit && (
        <CommonButton
          variant="contained"
          color="default"
          startIcon={<CheckRounded />}
          onClick={() =>
            handleSubmisionAction(ItemSubmissionStatus.PRESUBMITTED)
          }
          disabled={statusBtnDisabled}
          data-testid="btn-presubmit-submission"
        >
          {getString('submissionStatus.preSubmit')}
        </CommonButton>
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
            <SubmitButton
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
          {getString('submissionStatus.submit')}
        </CommonButton>
      )}
      <Dialog
        open={openCommentDialog}
        formId="update-submission-comment"
        content={
          <CommentForm
            formId="update-submission-comment"
            onSubmit={handleSubmit}
            setDialogProps={setDialogProps}
          />
        }
        showButton
        buttonText={getString('text.save')}
        buttonProps={{ disabled: true }}
        title={dialogTitle}
        handleToggle={handleDialogToggle}
        {...dialogProps}
      />
    </>
  );
}

export default SubmissionStatus;
