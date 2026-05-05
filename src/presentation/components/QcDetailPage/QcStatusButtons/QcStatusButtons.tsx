import { CheckRounded, CloseRounded } from '@material-ui/icons';
import { useLocalStorageState } from 'ahooks';
import _omit from 'lodash/omit';
import React from 'react';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useUpdateQCAnswersMutation } from 'data/slices/qcSlice';
import {
  MotorAnswerSheet,
  QCActions,
  QCSavePayload,
} from 'data/slices/qcSlice/interface';
import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import Dialog, { IDialogProps } from 'presentation/components/common/Dialog';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import useQcContext, {
  QC_QUESTIONS_KEY,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { getString } from 'presentation/theme/localization';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import CommentForm from './CommentForm';

import { generateCorrectAddonsAnswer } from '../helpers/utils';
import useQcStatus from '../hooks/useQcStatus';

interface QcStatusButtonsProps {
  orderId: string;
}

enum AnswerSheets {
  CRITICAL_MOTOR_ANSWER_SHEET = 'critical_motor_answer_sheet',
  NON_CRITICAL_MOTOR_ANSWER_SHEET = 'nonCriticalMotorAnswerSheet',
  PACKAGE_ANSWER_SHEET = 'package_answer_sheet',
}

function QcStatusButtons({ orderId }: QcStatusButtonsProps) {
  const {
    state: {
      orderDetail: contextOrderDetail,
      countdown: contextCountdown,
      answers: contextAnswers,
    },
  } = useQcContext();

  const {
    orderDetail: sliceOrderDetail,
    countdown: sliceCountdown,
    answers: sliceAnswers,
  } = useGetQcDetail();

  const [enablePassQC, setEnablePassQc] = React.useState(false);
  const [enableFailQC, setEnableFailQc] = React.useState(false);
  const [openCommentDialog, setOpenCommentDialog] = React.useState(false);
  const [qcActionStatus, setQcActionStatus] = React.useState<QCActions>(
    QCActions.QCActionApprove
  );

  const contextToToolkitRefactor = true;
  const orderDetail = contextToToolkitRefactor
    ? sliceOrderDetail
    : contextOrderDetail;
  const countdown = contextToToolkitRefactor
    ? sliceCountdown
    : contextCountdown;
  const answers = contextToToolkitRefactor ? sliceAnswers : contextAnswers;

  const { isApproved, isPreApproved, isPending, isRejected } =
    useQcStatus(orderDetail);
  const [answersLocal, setAnswerLocal] = useLocalStorageState<
    Record<string, any>
  >(QC_QUESTIONS_KEY, {
    defaultValue: {},
  });
  const isCompany = orderDetail?.order?.data?.policyHolder?.isCompany;
  const [dialogProps, setDialogProps] = React.useState<
    Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
  >();

  const criticalAnswersSheet: Partial<Record<Questions, boolean>> = {
    [Questions.HAS_CUSTOMER_LINE]: true, // need to remove after BE support Line and demo,
    [Questions.VEHICLE_MODIFICATIONS_VALUE]: true, // need to remove after demo,
  };

  if (isCompany) {
    criticalAnswersSheet[Questions.DOB_OF_THE_POLICYHOLDER] = true;
  }

  const [answerSheet, setAnswerSheet] = React.useState<
    Record<AnswerSheets, any>
  >({
    [AnswerSheets.CRITICAL_MOTOR_ANSWER_SHEET]: criticalAnswersSheet,
    [AnswerSheets.NON_CRITICAL_MOTOR_ANSWER_SHEET]: {},
    [AnswerSheets.PACKAGE_ANSWER_SHEET]: {},
  });

  const [updateQCAnswers, { isSuccess: updateQcSuccess }] =
    useUpdateQCAnswersMutation();
  const [addAndGetComment] = useOrderComments();
  const { data: user } = useGetAuthenticateQuery();

  const handleSubmit = (action: any) => {
    const answerSheetCopy = { ...answerSheet };
    const criticalAnswers =
      answerSheetCopy[AnswerSheets.CRITICAL_MOTOR_ANSWER_SHEET];
    if (orderDetail.order?.documentStatus === OrderDocumentStatus.PENDING) {
      criticalAnswers[Questions.GOOD_QUALITY_DOCS] = true;
    }

    const correctAddonsAnswer = generateCorrectAddonsAnswer(
      criticalAnswers,
      (qId) => {
        if (!qId || qId === '') return;
        delete answerSheetCopy[AnswerSheets.CRITICAL_MOTOR_ANSWER_SHEET]?.[qId];
      }
    );

    answerSheetCopy[AnswerSheets.CRITICAL_MOTOR_ANSWER_SHEET][
      Questions.CORRECT_ADDONS
    ] = correctAddonsAnswer;

    const payload: QCSavePayload = {
      name: `orders/${orderId}`,
      qc_action: qcActionStatus,
      motor_answer_sheet: answerSheetCopy as MotorAnswerSheet,
    };

    updateQCAnswers(payload);
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

  const handleDialogToggle = () => {
    setOpenCommentDialog((prev) => !prev);
  };

  const handleQcActionStatus = (action: QCActions) => {
    setQcActionStatus(action);
    handleDialogToggle();
  };

  React.useEffect(() => {
    if (!answers || !countdown) return;
    const excludeAnswers: any = [
      Questions.COMPANY_AGENT_INTRO,
      Questions.NOTIFY_BROKER_LICENSE,
      Questions.NOTIFY_RECORD_CONVERSATION,
      Questions.GOODBYE,
      Questions.ASKED_AVAILIBITY,
    ];

    if (!orderDetail?.data?.isOfflinePayment) {
      excludeAnswers.push(Questions.PREMIUM_PAYMENT_DOCUMENTS);
    }

    let hasRejectQuestion = false;
    Object.entries(answers).forEach((question) => {
      const [questionId, answerObj]: [string, any] = question;
      // Building payload for questions update API
      // check whether question is package related
      if (questionId.includes('orders/')) {
        const answersArray = Object.entries(answerObj);
        const packageRelatedAnswers = answersArray.reduce(
          (prev: any, curr: any) => ({ ...prev, [curr[0]]: curr[1].answer }),
          {}
        );
        // NOTE: Will solve the code smell later (after the DEMO)
        answersArray.forEach(([_, pkgAnswerObj]: [string, any]) => {
          if (!pkgAnswerObj.answer) {
            hasRejectQuestion = true;
          }
        });
        setAnswerSheet((prevSheet: any) => ({
          ...prevSheet,
          [AnswerSheets.PACKAGE_ANSWER_SHEET]: {
            ...prevSheet[AnswerSheets.PACKAGE_ANSWER_SHEET],
            [questionId]: packageRelatedAnswers,
          },
        }));
        return;
      }

      if (answerObj?.isCritical === undefined) return;

      const sheetUpdateKey = answerObj.isCritical
        ? AnswerSheets.CRITICAL_MOTOR_ANSWER_SHEET
        : AnswerSheets.NON_CRITICAL_MOTOR_ANSWER_SHEET;

      const isCompanyDob =
        isCompany && questionId === Questions.DOB_OF_THE_POLICYHOLDER;

      setAnswerSheet((prevSheet: any) => {
        const answer = isCompanyDob ? true : answerObj.answer;
        return {
          ...prevSheet,
          [sheetUpdateKey]: {
            ...prevSheet[sheetUpdateKey],
            [questionId]: answer,
          },
        };
      });
      if (
        !answerObj?.answer &&
        !excludeAnswers.includes(questionId) &&
        !isCompanyDob
      ) {
        hasRejectQuestion = true;
      }
    });

    // Keep button status disable if all questions are not checked
    const countDownTotal: number = Object.entries(countdown).reduce(
      (count: number, current: Array<any>) => count + current[1].length,
      0
    );

    if (countDownTotal > 0) {
      setEnablePassQc(false);
      setEnableFailQc(false);
      return;
    }

    if (hasRejectQuestion) {
      setEnablePassQc(false);
      setEnableFailQc(true);
    } else {
      setEnablePassQc(true);
      setEnableFailQc(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, countdown, isCompany]);

  React.useEffect(() => {
    if (updateQcSuccess) {
      setAnswerLocal({
        ..._omit(answersLocal, orderId),
      });
      window.location.reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateQcSuccess]);

  const rolesForCheck: Array<string> = [
    UserRoleID.Admin,
    UserRoleID.SuperAdmin,
    UserRoleID.Manager,
    UserRoleID.Supervisor,
    UserRoleID.QualityControl,
  ];
  const canAgentCheck = rolesForCheck.includes(user?.role || '');
  const isSaleAgent = user?.role === UserRoleID.SalesAgent;

  let updateDialogTitle;
  switch (qcActionStatus) {
    case QCActions.QCActionApprove:
      updateDialogTitle = getString('qc.passQc');
      break;
    case QCActions.QCActionReject:
      updateDialogTitle = getString('qc.failQc');
      break;
    default:
      updateDialogTitle = '';
  }

  const documentFailed =
    orderDetail.order?.documentStatus === OrderDocumentStatus.FAILED;

  return (
    <>
      {(isApproved || isPreApproved) && (
        <CommonButton
          variant="text"
          color="default"
          disabled
          startIcon={<CheckRounded />}
        >
          {getString('qc.passQc')}
        </CommonButton>
      )}
      {isRejected && isSaleAgent && (
        <CommonButton
          data-testid="issues-fixed-btn"
          variant="contained"
          color="success"
          disabled={!enablePassQC}
          onClick={() => handleQcActionStatus(QCActions.QCActionSalesNeedToFix)}
          startIcon={<CheckRounded />}
          className="mr-1"
        >
          {getString('qcStatus.issuesFixed')}
        </CommonButton>
      )}
      {isRejected && canAgentCheck && (
        <CommonButton
          variant="text"
          color="default"
          disabled
          startIcon={<CloseRounded />}
        >
          {getString('qc.failQc')}
        </CommonButton>
      )}
      {isPending && canAgentCheck && (
        <>
          <CommonButton
            variant="contained"
            color="success"
            disabled={!enablePassQC || documentFailed}
            startIcon={<CheckRounded />}
            onClick={() => handleQcActionStatus(QCActions.QCActionApprove)}
            data-testid="qc-status-approve"
          >
            {getString('qc.passQc')}
          </CommonButton>
          <CommonButton
            variant="contained"
            color="danger"
            disabled={!enableFailQC || documentFailed}
            startIcon={<CloseRounded />}
            onClick={() => handleQcActionStatus(QCActions.QCActionReject)}
            data-testid="qc-status-reject"
          >
            {getString('qc.failQc')}
          </CommonButton>
        </>
      )}
      <Dialog
        open={openCommentDialog}
        formId="update-qc-comment"
        content={
          <CommentForm
            formId="update-qc-comment"
            onSubmit={handleSubmit}
            setDialogProps={setDialogProps}
          />
        }
        showButton
        buttonText={getString('text.save')}
        buttonProps={{ disabled: true }}
        title={updateDialogTitle}
        handleToggle={handleDialogToggle}
        {...dialogProps}
      />
    </>
  );
}

export default QcStatusButtons;
