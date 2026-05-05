import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { getI18n } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  saveQcAnswers,
  saveQcPackageAnswers,
} from 'data/slices/qcSlice/reducer';
import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import Dialog, { IDialogProps } from 'presentation/components/common/Dialog';
import RadioFieldGroup, {
  Option,
} from 'presentation/components/common/RadioGroup/RadioGroup';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import useQcStatus from 'presentation/components/QcDetailPage/hooks/useQcStatus';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { questionFields } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import useQcContext, {
  updateQcPackageQuestion,
  updateQcQuestion,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { getString } from 'presentation/theme/localization';

interface SalesNeedsToFixProps {
  question: any;
  open: boolean;
  handleOptionSwitch?: (payload: string) => void;
  toggleOpen: () => void;
  saveAnswerToLocal?: (selection: any, answer: boolean) => void;
}

export function useEditFormOptions(): Option[] {
  const {
    state: { orderDetail: contextOrderDetail },
  } = useQcContext();

  const { orderDetail: sliceOrderDetail } = useGetQcDetail();
  const contextToToolkitRefactor = true;

  const orderDetail = contextToToolkitRefactor
    ? sliceOrderDetail
    : contextOrderDetail;

  const optionsDefault: any = [
    {
      value: 'update',
      label: getString('qc.updateDataMyself'),
    },
    {
      value: 'salesFix',
      label: getString('qc.salesNeedToFix'),
      status: 'danger',
    },
  ];

  const [editFormOptions, setEditFormOptions] = useState(optionsDefault);
  const { data: user } = useGetAuthenticateQuery();
  const { isRejected } = useQcStatus(orderDetail);
  const isSalesFixing = user?.role === UserRoleID.SalesAgent && isRejected;

  useEffect(() => {
    if (isSalesFixing) {
      setEditFormOptions(optionsDefault[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isRejected]);

  return editFormOptions;
}

function SalesNeedsToFix({
  question,
  open,
  toggleOpen,
  handleOptionSwitch = () => null,
  saveAnswerToLocal = () => null,
}: SalesNeedsToFixProps) {
  const { dispatch: dispatchQc } = useQcContext();
  const reduxDispatch = useDispatch();
  const [addAndGetComment] = useOrderComments();

  const [isEditable, setIsEditable] = useState(false);
  const [value, setValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('salesFix');
  const [buttonProps, setButtonProps] = useState({
    disabled: true,
  });
  const contextToToolkitRefactor = true;
  const [dialogProps, setDialogProps] = React.useState<
    Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
  >({
    buttonText: getString('qc.reportIssue'),
  });

  const editFormOptions = useEditFormOptions();

  useEffect(() => {
    const match = questionFields.find((field) => field.qId === question.qId);
    if (match) {
      setIsEditable(match.isEditable);
    }

    const { label = '', description = '', group = '' } = question;

    let popupTitle = `${getString(group)} - ${
      getString(label) || getString(description)
    }`;
    popupTitle =
      popupTitle.length > 60 ? `${popupTitle.substring(0, 40)}...` : popupTitle;

    if (question.groupId === 'driver') popupTitle = getString('qc.updateData');

    setDialogProps((prevState) => ({
      ...prevState,
      title: popupTitle,
    }));
  }, [question]);

  const { orderId } = useParams();

  const handleSubmit = async (comment: string) => {
    const commentPayload = {
      createBy: '',
      text: comment,
      orderId,
    };
    addAndGetComment(commentPayload, orderId);
    toggleOpen();
    setValue('');
    saveAnswerToLocal(question, false);
    // Update qc context state to decrease count
    if (question.name) {
      const packageAnswerPayload = {
        groupId: question.groupId,
        isCritical: question.isCritical,
        packageId: question.name,
        qId: question.qId,
        answer: false,
      };
      if (contextToToolkitRefactor) {
        reduxDispatch(saveQcPackageAnswers(packageAnswerPayload));
      }
      dispatchQc(updateQcPackageQuestion(packageAnswerPayload));
    } else {
      const answerPayload = {
        groupId: question.groupId,
        qId: question.qId,
        isCritical: question.isCritical,
        answer: false,
      };
      if (contextToToolkitRefactor) {
        reduxDispatch(saveQcAnswers(answerPayload));
      }
      dispatchQc(updateQcQuestion(answerPayload));
    }
  };

  const handleUpateOption = (e: any) => {
    const option = e.target.value;
    if (option === 'update') {
      toggleOpen();
      handleOptionSwitch(option);
    } else {
      setSelectedOption(option);
    }
  };

  const onSubmit = (event: any) => {
    event.preventDefault();
    const lng = 'th';
    let { label = '', description = '', group = '' } = question;
    label = label && getI18n().t(label, { lng });
    description = description && getI18n().t(description, { lng });
    group = group && getI18n().t(group, { lng });
    const thaiPopupTitle = `${group} - ${label || description}`;
    handleSubmit(`${thaiPopupTitle} - ${value.trim()}`);
  };

  const renderForm = () => (
    <form
      id="sales-needs-to-fix"
      data-testid="sales-needs-to-fix-form"
      onSubmit={onSubmit}
    >
      <Grid container>
        {isEditable ? (
          <Grid item xs={12}>
            <RadioFieldGroup
              row
              name="options"
              className="gap-0"
              value={selectedOption}
              onChange={handleUpateOption}
              options={editFormOptions}
            />
          </Grid>
        ) : null}
        <Grid item xs={12} className="mt-5">
          <CommonTextField
            label={getString('qc.comment')}
            value={value}
            fullWidth
            required
            multiline
            placeholder={getString('qc.typeHere')}
            minRows={2}
            onChange={(e) => setValue(e.target.value)}
          />
        </Grid>
      </Grid>
    </form>
  );

  const handleToggle = () => {
    toggleOpen();
    setValue('');
  };

  useEffect(() => {
    if (value.length) {
      setButtonProps({
        ...buttonProps,
        disabled: false,
      });
    } else {
      setButtonProps({
        ...buttonProps,
        disabled: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Dialog
      open={open}
      color="warning"
      content={renderForm()}
      handleToggle={handleToggle}
      data-testid="sales-needs-to-fix"
      showButton
      formId="sales-needs-to-fix"
      buttonProps={{ ...buttonProps }}
      {...dialogProps}
    />
  );
}

export default SalesNeedsToFix;
