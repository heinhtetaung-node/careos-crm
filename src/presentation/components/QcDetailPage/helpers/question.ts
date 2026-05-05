import camelCase from 'lodash/camelCase';
import _flatten from 'lodash/flatten';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _groupBy from 'lodash/groupBy';
import { getI18n } from 'react-i18next';

import { Item } from 'data/slices/orderPolicySlice/interface';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Titles } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import {
  questions,
  // type
  questionFields,
  Questions,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';
import { MotoTypes, PackageType } from 'shared/constants/orderType';

import { stringToDate } from './utils';

import { insuranceType } from '../hooks/usePackagesInfo';

const voluntaryQuestions = [
  Questions.COVERAGE,
  Questions.COVERAGE_VOLUNTARY_PACKAGE,
  Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
];

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
    name: policy.name,
    item: policy.motorItemType,
    label: insuranceType[policy.motorItemType],
    ...questionFields.find((q) => q.qId === qId),
  };
}

export function questionsFromConfig(questionConfig: any, callback: any) {
  _forEach(questionConfig, (_questions, groupName) => {
    _questions.forEach((question: any) => {
      callback(question, groupName);
    });
  });
}

function updateYoungestDriver(
  drivers: Record<string, any>[],
  qId: string,
  label: string
) {
  return drivers.map((question) => {
    if (question.qId === qId) {
      return {
        ...question,
        label,
      };
    }
    return question;
  });
}

export function generateQuestionConfig(data: OrderDataResponse) {
  const mergeQuestionsConfing = questions.map(({ qId, ...rest }) => ({
    qId,
    ...questionFields.find((q) => q.qId === qId),
    ...rest,
  }));

  const questionList = _groupBy(mergeQuestionsConfing, (c) => c.groupId);
  (questionList as any).packages = data?.items?.flatMap(
    ({ item, package: pkg }): any => {
      if (pkg?.packageType === PackageType.RENEWAL)
        voluntaryQuestions.push(Questions.PREMIUM_RENEWAL);
      if (item.motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY) {
        const question = questions.find(
          ({ qId }) => qId === Questions.COVERAGE
        );
        // add coverage details for mandatory
        return [
          { ...question, item: item.motorItemType, name: item.name },
          {
            ...question,
            label: 'qc.coverageDetails',
            insuranceType: item.motorItemType,
            name: item.name,
          },
        ] as any;
      }
      const voluntaryPackageQuestions = questions
        .filter(({ qId }) => voluntaryQuestions.includes(qId))
        .map((q) => {
          const label =
            q.qId === Questions.COVERAGE_VOLUNTARY_SUM_INSURED
              ? getString('qc.sumInsured')
              : q.label;
          return { ...q, item: item.motorItemType, label, name: item.name };
        });
      // add coverage details for voluntary
      const coverageDetails = {
        ...questions.find(({ qId }) => qId === Questions.COVERAGE),
        label: 'qc.coverageDetails',
        insuranceType: item.motorItemType,
        name: item.name,
      };
      return [...voluntaryPackageQuestions, coverageDetails];
    }
  );

  (questionList as any).policyStartDate = data?.items?.map(({ item }) => {
    if (item.motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY)
      return mapPoliciesWithQuestion(item, Questions.POLICYSTARTDATE);
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

  const { firstDriverDOB, secondDriverDOB } = data?.order?.data ?? {};
  const isFirstDriverYoungest =
    firstDriverDOB && secondDriverDOB
      ? stringToDate(firstDriverDOB) > stringToDate(secondDriverDOB)
      : undefined;
  if (isFirstDriverYoungest === true) {
    (questionList as any).driver = updateYoungestDriver(
      questionList.driver,
      Questions.DRIVER_ONE_NAME_AGE,
      'qc.firstDriverYoungest'
    );
  }
  // To prevent undefined case Driver #2 will always be the youngest
  else if (isFirstDriverYoungest === false) {
    (questionList as any).driver = updateYoungestDriver(
      questionList.driver,
      Questions.DRIVER_TWO_NAME_AGE,
      'qc.secondDriverYoungest'
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

/** QC vehicle steps kept read-only when BROK-4710 is off (model; OIC + driving purpose share one question). */
const QC_VEHICLE_LOCKED_WHEN_ORDER_UPDATE_FLAG_OFF: Questions[] = [
  Questions.VEHICLE_MODEL,
  Questions.OIC_DRIVING_PURPOSE,
];

export function applyVehicleEditPolicy(
  questionConfig: Record<string, any>,
  canEditVehicleInfo: boolean,
  /** When false (BROK-4710 off on QC), model + OIC/driving purpose stay read-only. */
  isEnabledVehicleUpdateWithinOrder = true
) {
  if (!questionConfig?.vehicle) {
    return questionConfig;
  }

  return {
    ...questionConfig,
    vehicle: questionConfig.vehicle.map((question: Record<string, any>) => {
      const lockedWhenFlagOff =
        !isEnabledVehicleUpdateWithinOrder &&
        QC_VEHICLE_LOCKED_WHEN_ORDER_UPDATE_FLAG_OFF.includes(question.qId);

      if (lockedWhenFlagOff) {
        return { ...question, isEditable: false };
      }

      return {
        ...question,
        isEditable: canEditVehicleInfo ? question.isEditable : false,
      };
    }),
  };
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

      if (addonsAnswer !== undefined) {
        return addonsAnswer;
      }

      return answerByQid;
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
      const itemFromOrder = orderData.items.find(
        (policy: any) => policy.item.name === qId
      );
      const motorType = _get(itemFromOrder, 'item.motorItemType');
      const packageType = _get(itemFromOrder, 'package.packageType');
      const mandatoryQuestionsToSkip = new Set([
        Questions.COVERAGE_VOLUNTARY_PACKAGE,
        Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
        Questions.PREMIUM_RENEWAL,
      ]);
      packages.forEach(([pkgQid, pkgAnswersObj]: [string, any]) => {
        const pkgMatch = questions.find((i) => i.qId === pkgQid);
        const payload = {
          groupId: pkgMatch?.groupId,
          isCritical: pkgMatch?.isCritical || false,
          name: qId,
          qId: pkgQid,
          answer: pkgAnswersObj.answer,
        };
        // Mandatory valid answers
        if (motorType === MotoTypes.MOTOR_TYPE_COMPULSORY) {
          if (!mandatoryQuestionsToSkip.has(pkgQid as Questions)) {
            callback(payload, pkgMatch?.groupId);
          }
        } else {
          // Voluntary and if question is not PREMIUM_RENEWAL, exclude packageType question
          if (packageType !== PackageType.RENEWAL) {
            if (pkgQid !== Questions.PREMIUM_RENEWAL) {
              callback(payload, pkgMatch?.groupId);
            }
            return;
          }
          callback(payload, pkgMatch?.groupId);
        }
      });
    } else {
      const questionsConfig = addonQuestionConfig
        ? [...addonQuestionConfig, ...questions]
        : questions;
      const match = questionsConfig.find((i) => i.qId === qId);
      const ignoredQuestions = new Set([
        Questions.VEHICLE_MODIFICATIONS_VALUE,
        Questions.HAS_CUSTOMER_LINE,
      ]);
      let overrideAnswer: boolean = answersObj.answer;
      if (
        qId === Questions.PROBLEM_WITH_INSTALLMENT &&
        orderData?.order?.isFullyPaid
      ) {
        overrideAnswer = true;
      }

      if (!ignoredQuestions.has(qId as Questions)) {
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
