import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { saveQcAnswers } from 'data/slices/qcSlice/reducer';
import { useGetQcDetail } from 'data/slices/qcSlice/selector';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import QcInputContainer, {
  QcQuestion,
} from 'presentation/components/common/QcInputContainer/QcInputContainer';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import {
  Questions,
  QuestionsList,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import useQcContext, {
  updateQcQuestion,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';
import { getString } from 'presentation/theme/localization';
import { MotoTypes } from 'shared/constants/orderType';
import { findArrayOfString } from 'utils/string';

import { titleTextInAllLanguages } from '../helpers/question';
import useQcStatus from '../hooks/useQcStatus';

function hideQcContainerParts(qId: Questions) {
  return qId === Questions.COVERAGE;
}

const QcInputContainerWrapper = withStyles({
  root: {
    width: '100%',
  },
})(Box);

interface QcContainerListProps {
  infoPanels: any;
  questionList: QuestionsList;
  wrongAnswersList?: Array<string>;
  shouldReadonly: boolean;
  handleQuestionReject: (selection: any) => void;
  handleQuestionApprove: (selection: any) => void;
  handleQuestionEdit: (selection: any) => void;
  setSelectedPackage: (pkg: MotoTypes) => void;
  setOpenPackageDetails: (toggle: boolean) => void;
}

export default function QcContainerList({
  infoPanels,
  questionList,
  wrongAnswersList,
  shouldReadonly,
  handleQuestionReject,
  handleQuestionApprove,
  setSelectedPackage,
  setOpenPackageDetails,
  handleQuestionEdit,
}: Readonly<QcContainerListProps>) {
  const {
    state: { orderDetail: contextOrderDetail, answers: contextAnswers },
    dispatch,
  } = useQcContext();

  const { orderDetail: sliceOrderDetail, answers: sliceAnswers } =
    useGetQcDetail();

  const contextToToolkitRefactor = true;

  const orderDetail = contextToToolkitRefactor
    ? sliceOrderDetail
    : contextOrderDetail;
  const answers = contextToToolkitRefactor ? sliceAnswers : contextAnswers;

  const reduxDispatch = useDispatch();
  const { isPending } = useQcStatus(orderDetail);
  const { data: user } = useGetAuthenticateQuery();
  const isSaleAgent = user?.role === UserRoleID.SalesAgent;
  const isOrderCancelled = orderDetail?.order?.isCancelled ?? false;

  const openPackageDetails = React.useCallback(
    (insuranceType: MotoTypes) => () => {
      setOpenPackageDetails(true);
      setSelectedPackage(insuranceType);
    },
    [setOpenPackageDetails, setSelectedPackage]
  );

  // Is only sales agent can fix the wrong question?
  return (
    <QcInputContainerWrapper>
      {questionList?.map(({ qId, ...rest }, idx) => {
        const { item = '' } = rest as Record<string, any>;
        const question: QcQuestion = { qId: qId as string, ...rest };
        if (isOrderCancelled) {
          question.disabled = true;
        }
        if (!qId.includes('addons')) {
          question.value = infoPanels[qId] ?? '';
        }
        if (item) {
          question.value = infoPanels[item]?.[qId] ?? '';
          // Add packageTypeLabel for COVERAGE questions to display badge
          if (qId === Questions.COVERAGE) {
            question.packageTypeLabel = infoPanels[item]?.packageTypeLabel;
          }
          if (hideQcContainerParts(qId)) {
            // need to hide some part of qc input container for insurance type (insurance type is not question)
            question.hideQcCheck = hideQcContainerParts(qId);
            question.label = '';
          }
        }
        if (
          qId === Questions.PREMIUM &&
          item === MotoTypes.MOTOR_TYPE_COMPULSORY
        ) {
          delete question.helperText;
        }
        const wrongFromStart = wrongAnswersList?.find(
          (wrongQid) => wrongQid === qId
        );
        // Check answer for package related question
        let answer;
        if (question?.name) {
          const pkgAnswers = answers[question?.name]?.[question.qId]?.answer;
          if (answers && pkgAnswers !== answer) {
            answer = pkgAnswers;
          }
        }
        // Check answer for general question
        if (
          !question.name &&
          answers &&
          answers[question.qId]?.answer !== answer
        ) {
          answer = answers[question.qId]?.answer;
        }
        question.answer = answer;

        // Enable when: Is sales agent, is answer is wrong from beginning, is rejected
        // Not enable when: status is pending and is sales agent role
        question.readOnly = wrongFromStart ? false : shouldReadonly;
        if (isPending && isSaleAgent) {
          question.readOnly = true;
        }

        // Disable if driver DOB is not exists
        let setDriverAnswer = false;
        const firstDriverDOBEmpty =
          qId === Questions.DRIVER_ONE_NAME_AGE &&
          !orderDetail.order?.data?.firstDriverDOB;

        const secondDriverDOBEmpty =
          qId === Questions.DRIVER_TWO_NAME_AGE &&
          !orderDetail.order?.data?.secondDriverDOB;

        if (firstDriverDOBEmpty) {
          question.disabled = true;
          setDriverAnswer = true;
        }

        if (secondDriverDOBEmpty) {
          question.disabled = true;
          setDriverAnswer = true;
        }

        if (setDriverAnswer && !question.answer) {
          const answerPayload = {
            groupId: rest.groupId,
            qId,
            isCritical: true,
            answer: true,
          };
          if (contextToToolkitRefactor) {
            reduxDispatch(saveQcAnswers(answerPayload));
          }
          dispatch(updateQcQuestion(answerPayload));
        }

        if (qId === Questions.HAS_CUSTOMER_EMAIL) {
          const customerEmail = orderDetail.customer.emails ?? [];

          if (!customerEmail.length) {
            question.chip = getString('qc.missingEmailWarning');
          }
        }
        if (qId === Questions.POLICYHOLDER_NAME_TITLE) {
          const firstName = (
            orderDetail.order?.data?.policyHolder?.firstName ?? ''
          ).toLowerCase();
          if (
            firstName?.length > 0 &&
            findArrayOfString(titleTextInAllLanguages(), firstName)
          ) {
            question.chip = getString('qc.checkTitleWarning');
          }
        }

        if (qId === Questions.CORRECT_ID_NUMBER) {
          const { idType, idNumber } = orderDetail.order?.data ?? {};
          if (
            idType === 'NationalID' &&
            (!parseFloat(idNumber) ||
              parseFloat(idNumber).toString().length !== 13 ||
              idNumber.length !== 13)
          ) {
            question.chip = getString('qc.checkIdNumberWarning');
          }
        }

        if (rest.label === 'qc.coverageDetails') {
          question.actionButton = () => (
            <CommonButton
              color="default"
              variant="text"
              size="small"
              onClick={openPackageDetails(
                (rest as Record<string, any>)?.insuranceType
              )}
              startIcon={<VisibilityIcon fontSize="small" />}
            >
              {getString('qc.seeDetails')}
            </CommonButton>
          );
        }
        const key = `${qId}${idx}`;
        return (
          <QcInputContainer
            key={key}
            question={question}
            handleQuestionReject={handleQuestionReject}
            handleQuestionApprove={handleQuestionApprove}
            handleQuestionEdit={handleQuestionEdit}
          />
        );
      })}
    </QcInputContainerWrapper>
  );
}
