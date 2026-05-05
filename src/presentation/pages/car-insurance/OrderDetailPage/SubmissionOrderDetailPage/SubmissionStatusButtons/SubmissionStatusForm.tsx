import React, { useState, ChangeEvent, useEffect } from 'react';

import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import { IDialogProps } from 'presentation/components/common/Dialog';
import { Option } from 'presentation/components/common/FormikFields/LeadAutocomplete/Autocomplete.helper';
import { getString } from 'presentation/theme/localization';
import {
  ItemApprovalStatus,
  ItemSubmissionStatus,
} from 'shared/constants/orderType';

interface CommentFormProps {
  setDialogProps?: React.Dispatch<
    React.SetStateAction<
      Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
    >
  >;
  onSubmit: (payload: any) => void;
  submissionStatus: string;
  isQcApproved: boolean;
  handleRejectReason?: () => void;
}

const statusItems: Option[] = [
  {
    id: 'ReadyToSubmit',
    value: ItemSubmissionStatus.READY_TO_SUBMIT,
    title: getString('submissionStatus.readyToSubmit'),
  },
  {
    id: 'PreSubmit',
    value: ItemSubmissionStatus.PRESUBMITTED,
    title: getString('submissionStatus.preSubmit'),
  },
  {
    id: 'Submit',
    value: ItemSubmissionStatus.SUBMITTED,
    title: getString('submissionStatus.submit'),
  },
];

const statusItemApproved: Option[] = [
  {
    id: 'Approved',
    value: ItemApprovalStatus.APPROVED,
    title: getString('text.approve'),
  },
  {
    id: 'Pending',
    value: ItemApprovalStatus.PENDING,
    title: getString('text.pending'),
  },
  {
    id: 'Rejected',
    value: ItemApprovalStatus.REJECTED,
    title: getString('text.reject'),
  },
];

export function getOptions(submissionStatus: string, isQcApproved = false) {
  switch (submissionStatus) {
    case ItemSubmissionStatus.SUBMITTED:
      return statusItemApproved;
    case ItemSubmissionStatus.PRESUBMITTED:
      return statusItems.filter((i) => i.id !== 'PreSubmit');
    case ItemSubmissionStatus.PENDING:
      return isQcApproved
        ? statusItems.filter((i) => i.id !== 'PreSubmit')
        : statusItems.slice(1, -1);
    default:
      return statusItems.slice(2);
  }
}

function SubmissionStatusForm({
  setDialogProps,
  onSubmit,
  submissionStatus,
  isQcApproved = false,
  handleRejectReason,
}: Readonly<CommentFormProps>) {
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Option | null | undefined>(null);

  useEffect(() => {
    setStatusOptions(getOptions(submissionStatus, isQcApproved));
    if (submissionStatus === ItemSubmissionStatus.PENDING && !isQcApproved) {
      setStatus(statusItems.find((i) => i.id === 'PreSubmit'));
    } else if (submissionStatus === ItemSubmissionStatus.SUBMITTED) {
      setStatus(statusItemApproved.find((i) => i.id === 'Approved'));
    } else {
      setStatus(statusItems.find((i) => i.id === 'Submit'));
    }
  }, [isQcApproved, submissionStatus]);

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const updateDialogProps = (
    commentVal: string,
    statusVal: Option | null | undefined
  ) => {
    if (!setDialogProps) return;
    if (commentVal && commentVal?.length > 3 && statusVal) {
      setDialogProps({
        buttonProps: {
          disabled: false,
        },
      });
    } else {
      setDialogProps({
        buttonProps: {
          disabled: true,
        },
      });
    }
  };

  const handleUpdateSelect = (_event: object, selections: any) => {
    if (selections?.id === 'Rejected') {
      handleRejectReason?.();
    }
    setStatus(selections);
    updateDialogProps(comment, selections);
  };

  const handleCommentBlur = (event: any) => {
    const commentValue: any = event.target.value;
    updateDialogProps(commentValue, status);
  };

  const handleSubmitData = (event: any) => {
    event.preventDefault();
    onSubmit({
      comment,
      status: status?.value,
    });
  };

  return (
    <form
      id="update-submission-comment"
      onSubmit={handleSubmitData}
      data-testid="submission-status-form"
    >
      <Autocomplete
        textFieldProps={{
          variant: 'outlined',
          placeholder: getString('text.select'),
        }}
        options={statusOptions}
        onChange={handleUpdateSelect}
        value={status}
        optionTextKey="title"
      />
      <CommonTextField
        label={getString('qc.comment')}
        placeholder={getString('qc.typeHere')}
        multiline
        minRows={4}
        variant="outlined"
        inputProps={{ onKeyUp: handleCommentBlur }}
        onChange={handleCommentChange}
        className="w-full mt-[15px]"
      />
    </form>
  );
}

export default SubmissionStatusForm;
