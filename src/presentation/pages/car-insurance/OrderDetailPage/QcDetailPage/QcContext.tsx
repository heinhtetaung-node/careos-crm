import _groupBy from 'lodash/groupBy';
import _has from 'lodash/has';
import React, { createContext, useContext } from 'react';

import {
  Questions,
  questions,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { OrderDocumentStatus, PackageType } from 'shared/constants/orderType';

export type State = {
  orderDetail: any;
  answers: any;
  countdown: any;
};

export type PackagesAnswers = {
  [key: string]: any[];
};

const generalQuestions = [
  Questions.POLICYSTARTDATE,
  Questions.PREMIUM,
  Questions.COVERAGE,
];

const voluntaryQuestions = [
  Questions.COVERAGE_VOLUNTARY_PACKAGE,
  Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
];

export const initialState = { orderDetail: {}, answers: {}, countdown: {} };
export const QC_QUESTIONS_KEY = 'new_qc_questions';

export const updateQcQuestion = (payload: any) => ({
  type: 'SAVE_ANSWER',
  payload,
});

export const updateQcPackageQuestion = (payload: any) => ({
  type: 'SAVE_PACKAGE_ANSWER',
  payload,
});

export const updateCountDown = (payload: any) => ({
  type: 'UPDATE_COUNTDOWN',
  payload,
});

export const updateAnswers = (payload: any) => ({
  type: 'UPDATE_ANSWERS',
  payload,
});

export const transformPackageAnswers = (
  items: any,
  answers: any,
  hasPremiumDiscounts: boolean,
  hasPremiumInvoice: boolean,
  hasPremiumPaymentDocs: boolean,
  isOfflinePayment: boolean,
  hasProblemInstallment: boolean,
  isFullyPaid: boolean
) => {
  const pkgs: PackagesAnswers = {
    policyStartDate: [],
    premium: [],
    packages: [],
  };
  if (!hasPremiumDiscounts) {
    pkgs.premium.push(
      questions.find((q: any) => q.qId === Questions.PREMIUM_DISCOUNTS)
    );
  }
  if (!hasPremiumInvoice) {
    pkgs.premium.push(
      questions.find((q: any) => q.qId === Questions.PREMIUM_INVOICE)
    );
  }
  if (isOfflinePayment && !hasPremiumPaymentDocs) {
    pkgs.premium.push(
      questions.find((q: any) => q.qId === Questions.PREMIUM_PAYMENT_DOCUMENTS)
    );
  }

  if (!isFullyPaid && !hasProblemInstallment) {
    pkgs.premium.push(
      questions.find((q: any) => q.qId === Questions.PROBLEM_WITH_INSTALLMENT)
    );
  }
  // NOTE: Improvement - remove rule and fix issue with map
  // eslint-disable-next-line array-callback-return
  items.map((i: any) => {
    // if answer exists for each question
    generalQuestions.forEach((j) => {
      if (!(j in (answers[i.item.name] || {}))) {
        const question = questions.find((q: any) => q.qId === j);
        const group = question ? question.groupId : '';
        pkgs[group].push({
          ...question,
          name: i.item.name,
        });
      }
    });
    // if answer exists for each question for voluntary items
    if (i.item.motorItemType !== 'MOTOR_TYPE_COMPULSORY') {
      voluntaryQuestions.forEach((j) => {
        if (!(j in (answers[i.item.name] || {}))) {
          const question = questions.find((q: any) => q.qId === j);
          const group = question ? question.groupId : '';
          pkgs[group].push({
            ...question,
            name: i.item.name,
          });
        }
      });
      // if answer exists for each question if renewal type for voluntary items
      if (
        !(Questions.PREMIUM_RENEWAL in (answers[i.item.name] || {})) &&
        i.package?.packageType === PackageType.RENEWAL
      ) {
        const renewal = questions.find(
          (q: any) => q.qId === Questions.PREMIUM_RENEWAL
        );
        pkgs.packages.push({
          ...renewal,
          name: i.item.name,
        });
      }
    }
  });
  return pkgs;
};

export function init({ answers, orderDetail }: State) {
  let countdown = {};
  Object.entries(_groupBy(questions, 'groupId')).forEach(([k, v]) => {
    const gId = k;
    countdown = {
      ...countdown,
      [gId]: answers
        ? v.filter((i) => !Object.keys(answers).includes(i.qId) && !i.disabled)
        : v.filter((i) => !i.disabled),
    };
  });
  return {
    orderDetail,
    answers,
    countdown,
  };
}

export function qcReducer(
  state: { orderDetail: any; answers: any; countdown: any },
  action: { type: string; payload: any }
) {
  switch (action.type) {
    case 'ADD_ORDER_DETAIL': {
      // Start of checking for answers
      let newCountdown = { ...state.countdown };
      if (state.answers) {
        const hasPremiumDiscounts = Object.keys(state.answers).includes(
          Questions.PREMIUM_DISCOUNTS
        );
        const hasPremiumInvoice = Object.keys(state.answers).includes(
          Questions.PREMIUM_INVOICE
        );
        const hasPremiumPaymentDocs = Object.keys(state.answers).includes(
          Questions.PREMIUM_PAYMENT_DOCUMENTS
        );
        const hasProblemInstallment = Object.keys(state.answers).includes(
          Questions.PROBLEM_WITH_INSTALLMENT
        );
        const { isOfflinePayment } = action?.payload?.data ?? false;
        const { isFullyPaid } = action?.payload?.order ?? false;
        const { isCompany } =
          action?.payload?.order?.data?.policyHolder ?? false;
        const pkgs = transformPackageAnswers(
          action.payload.items,
          state.answers,
          hasPremiumDiscounts,
          hasPremiumInvoice,
          hasPremiumPaymentDocs,
          isOfflinePayment,
          hasProblemInstallment,
          isFullyPaid
        );
        if (isCompany) {
          const policyholder = newCountdown?.policyholder?.filter(
            (p: any) => p.qId !== Questions.DOB_OF_THE_POLICYHOLDER
          );
          newCountdown.policyholder = policyholder;
        }
        // NOTE: Reduce complexity of this part
        if (
          action.payload?.order?.documentStatus === OrderDocumentStatus.PENDING
        ) {
          delete newCountdown.documents;
        }
        newCountdown = {
          ...newCountdown,
          ...pkgs,
        };
      }
      return {
        ...state,
        orderDetail: action.payload,
        countdown: newCountdown,
      };
    }
    // End of checking for answers
    case 'SAVE_ANSWER': {
      const { qId, answer, groupId, questionConfig } = action.payload;
      const newCountdown = { ...state.countdown };
      const countdown = state.countdown[groupId] ?? [];
      if (
        state.orderDetail?.order?.documentStatus === OrderDocumentStatus.PENDING
      ) {
        delete newCountdown.documents;
      }

      const stateQuestionExists = _has(state.answers, qId);
      const sameQuestionClick =
        stateQuestionExists && state.answers[qId].answer === answer;
      if (sameQuestionClick) {
        delete state.answers[qId];
        const questionsConfig = questionConfig?.addOns
          ? [...questionConfig.addOns, ...questions]
          : questions;
        const missingQuestion = questionsConfig.filter(
          (question) => question.qId === qId
        );
        return {
          ...state,
          countdown: {
            ...newCountdown,
            [groupId]: [...newCountdown[groupId], ...missingQuestion],
          },
        };
      }

      return {
        ...state,
        answers: {
          ...state.answers,
          [qId]: {
            answer,
            isCritical: action.payload.isCritical,
          },
        },
        countdown: {
          ...newCountdown,
          [groupId]: countdown.filter((i: any) => i.qId !== qId),
        },
      };
    }
    case 'SAVE_PACKAGE_ANSWER': {
      const newAnswer: any = { ...state.answers };
      const newCountdown: any = { ...state.countdown };

      const { qId, groupId, packageId, answer, isCritical } = action.payload;
      const statePkgQuestion = _has(newAnswer, `${packageId}.${qId}`);
      const samePkgQuestionClick =
        statePkgQuestion && newAnswer[packageId][qId].answer === answer;

      if (samePkgQuestionClick) {
        delete state.answers[packageId][qId];
        const packageQuestion = questions.filter(
          (question) => question.qId === qId
        )[0];
        return {
          ...state,
          countdown: {
            ...state.countdown,
            [groupId]: [
              ...state.countdown[groupId],
              {
                ...packageQuestion,
                name: packageId,
              },
            ],
          },
        };
      }

      newAnswer[packageId] = {
        ...state.answers[packageId],
        [qId]: {
          answer,
          isCritical,
        },
      };
      newCountdown[groupId] = state.countdown[groupId].filter(
        (packages: any) =>
          // Find package item in countdown and remove it
          !(packages.name === packageId && packages.qId === qId)
      );
      return {
        ...state,
        answers: newAnswer,
        countdown: newCountdown,
      };
    }
    case 'UPDATE_COUNTDOWN': {
      return {
        ...state,
        countdown: {
          ...state.countdown,
          ...action.payload,
        },
      };
    }
    case 'UPDATE_ANSWERS': {
      return {
        ...state,
        answers: {
          ...state.answers,
          ...action.payload,
        },
      };
    }
    case 'RESET':
      return init(action.payload);
    default:
      return state;
  }
}

export const QcContext = createContext<{
  state: State;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});

const useQcContext = () => {
  const context = useContext(QcContext);

  if (context === undefined) {
    throw new Error('Error with useQcContext');
  }
  return context;
};

export default useQcContext;
