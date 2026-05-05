import camelCase from 'lodash/camelCase';
import _flatten from 'lodash/flatten';
import _forEach from 'lodash/forEach';
import _groupBy from 'lodash/groupBy';
import { getI18n } from 'react-i18next';

import { Item } from 'data/slices/orderPolicySlice/interface';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Titles } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import {
  // type
  questionFields,
  questionGroups,
  questions,
  Questions,
} from '../config';

export const titleTextInAllLanguages = () => {
  const titlesCode = Object.keys(Titles).map(
    (title: string) => `policyholderTitle.${camelCase(title)}`
  );
  const allLanguages = getI18n()?.services?.resourceStore?.data ?? {};
  const titlesText = Object.keys(allLanguages).map((lang) =>
    titlesCode.map((title: string) =>
      getI18n().t(title, { lng: lang }).toLowerCase()
    )
  );
  return titlesText?.length > 0 ? _flatten(titlesText) : [];
};

// NOTE: if BE decide to remove archive question completely, we can remove this one!!.
const archiveQuestionImportance: Partial<Record<Questions, boolean>> = {
  [Questions.CLAIM_CONDITIONS]: true,
  [Questions.NO_RUDENESS]: true,
  [Questions.RECORD_CONVERSATION_PERMISSION]: true,
  [Questions.DOB_OF_THE_POLICYHOLDER]: true,
  [Questions.COMPANY_AGENT_INTRO]: false,
  [Questions.NOTIFY_RECORD_CONVERSATION]: false,
  [Questions.NOTIFY_BROKER_LICENSE]: false,
  [Questions.GOODBYE]: false,
  [Questions.ASKED_AVAILIBITY]: false,
};

function mapPoliciesWithQuestion(policy: Item, qId: Questions) {
  return {
    ...questions.find((q) => q.qId === qId),
    ...questionFields.find((q) => q.qId === qId),
    name: policy.name,
  };
}

export function questionsFromConfig(questionConfig: any, callback: any) {
  _forEach(questionConfig, (_questions, groupName) => {
    _questions.forEach((question: any) => {
      callback(question, groupName);
    });
  });
}

export function generateQuestionConfig(data: OrderDataResponse) {
  const mergeQuestionsConfing = questions.map(({ qId, ...rest }) => ({
    qId,
    ...questionFields.find((q) => q.qId === qId),
    ...rest,
  }));

  const questionList = _groupBy(mergeQuestionsConfing, (c) => c.groupId);
  (questionList as any).packages = data?.items?.flatMap(({ item }) => {
    return questions
      .filter(({ groupId }) => groupId === questionGroups.packages.id)
      .map((q) => ({
        ...q,
        name: item.name,
      }));
  });

  (questionList as any).policyStartDate = data?.items?.map(({ item }) => {
    return mapPoliciesWithQuestion(item, Questions.POLICYSTARTDATE);
  });

  if (!data?.data?.isOfflinePayment) {
    questionList.premium = questionList.premium.filter(
      (question) => question.qId !== Questions.PREMIUM_PAYMENT_DOCUMENTS
    );
  }

  if (data?.order?.isFullyPaid) {
    questionList.premium = questionList.premium.filter(
      (question) => question.qId !== Questions.PROBLEM_WITH_INSTALLMENT
    );
  }

  const beforeEditPremium = questionList.premium.slice(1);
  const premiums =
    data?.items?.map(({ item }) =>
      mapPoliciesWithQuestion(item, Questions.PREMIUM)
    ) || [];
  (questionList as any).premium = [...premiums, ...beforeEditPremium];
  return questionList;
}

export const transformPackages = (v: any) => {
  const final: any = {};
  Object.entries(v).forEach(([key, value]) => {
    const match = questions.find((i) => i.qId === final[key]);
    final[key] = {
      answer: value,
      isCritical: match?.isCritical,
    };
  });
  return final;
};

export const formatSavedAnswers = (
  answers: any,
  addonQuestionConfig?: Record<string, any>[]
) => {
  if (!answers) return {};
  let result: Record<string, any> = {};
  Object.entries(answers).forEach(([k, v]) => {
    if (typeof v === 'boolean') {
      const match = questions.find((i) => i.qId === k);
      result = {
        ...result,
        [k]: {
          answer: v,
          isCritical:
            match?.isCritical ?? archiveQuestionImportance[k as Questions],
        },
      };
    } else {
      result = {
        ...result,
        [k]: transformPackages(v),
      };
    }
  });
  if (addonQuestionConfig) {
    const correctAddonsAnswer = (qId: string) => {
      const { answer: addonsAnswer } = result?.correctAddons ?? {};
      const answerByQid = answers?.[qId];
      return addonsAnswer !== undefined ? addonsAnswer : answerByQid;
    };
    addonQuestionConfig.forEach(({ qId, isCritical }) => {
      result[qId] = {
        answer: correctAddonsAnswer(qId),
        isCritical,
      };
    });
  }
  return result;
};

export function flattenAnswersFromApi(
  answersData: any,
  addonQuestionConfig?: any
) {
  let answerFormatted: any;
  Object.entries(answersData).forEach(([_, answersObj]) => {
    answerFormatted = {
      ...answerFormatted,
      ...(answersObj as any),
    };
  });
  return formatSavedAnswers(answerFormatted, addonQuestionConfig);
}

export function questionConfigFromAnswers(
  answersData: any,
  orderData: OrderDataResponse,
  callback: any,
  addonQuestionConfig?: any
) {
  Object.entries(answersData).forEach(([qId, answersObj]: [string, any]) => {
    if (qId.includes('orders')) {
      const packages = Object.entries(answersObj);
      packages.forEach(([pkgQid, pkgAnswersObj]: [string, any]) => {
        const pkgMatch = questions.find((i) => i.qId === pkgQid);
        const payload = {
          groupId: pkgMatch?.groupId,
          isCritical: pkgMatch?.isCritical || false,
          name: qId,
          qId: pkgQid,
          answer: pkgAnswersObj.answer,
        };
        callback(payload, pkgMatch?.groupId);
      });
    } else {
      const questionsConfig = addonQuestionConfig
        ? [...addonQuestionConfig, ...questions]
        : questions;
      const match = questionsConfig.find((i) => i.qId === qId);
      const ignoredQuestions = [Questions.HAS_CUSTOMER_LINE];
      let overrideAnswer: boolean = answersObj.answer;
      if (
        qId === Questions.PROBLEM_WITH_INSTALLMENT &&
        orderData?.order?.isFullyPaid
      ) {
        overrideAnswer = true;
      }

      if (!ignoredQuestions.includes(qId as Questions)) {
        callback(
          {
            groupId: match?.groupId,
            qId,
            isCritical: answersObj.isCritical,
            answer: overrideAnswer,
          },
          match?.groupId
        );
      }
    }
  });
}
