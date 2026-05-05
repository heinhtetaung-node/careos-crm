import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import qcAnswersFromApiMock from 'mock-data/QcAnswers.mock';

import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';

import {
  applyVehicleEditPolicy,
  flattenAnswersFromApi,
  generateQuestionConfig,
  questionConfigFromAnswers,
  questionsFromConfig,
  titleTextInAllLanguages,
  transformPackages,
} from './question';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  getI18n: () => ({
    t: (str: string) => str,
    services: {
      resourceStore: {
        data: {
          en: {},
          th: {},
        },
      },
    },
  }),
}));

test('Should questionsFromConfig function works', async () => {
  const questionConfig = generateQuestionConfig(
    OrderDetail as unknown as OrderDataResponse
  );

  questionsFromConfig(questionConfig, (question: any, groupName: any) => {
    expect(groupName).not.toBeNull();
    expect(question.qId).not.toBeNull();
    expect(question.isCritical).not.toBeNull();
  });
});

test('Should flattenAnswersFromApi/formatSavedAnswers function works', async () => {
  const flattenAnswers: Record<string, any> = flattenAnswersFromApi(
    qcAnswersFromApiMock.motorAnswerSheet
  );
  expect(flattenAnswers.orders1).not.toBeNull();
  expect(flattenAnswers.orders1.coverageDetailCorrect.answer).not.toBeNull();
});

test('Should questionConfigFromAnswers function works', async () => {
  questionConfigFromAnswers(
    flattenAnswersFromApi(qcAnswersFromApiMock.motorAnswerSheet),
    OrderDetail as any,
    (answersObject: Record<string, any>, groupName: string) => {
      expect(groupName).not.toBeNull();
      if (groupName === 'Packages') {
        expect(groupName).toBe('Packages');
        expect(answersObject.name).not.toBeNull();
      }
    }
  );
});

test('Transform packages answers from localstorage', () => {
  const payload = {
    coverageDetailCorrect: false,
    sumInsured: true,
  };
  const result = transformPackages(payload);
  expect(result).toEqual({
    coverageDetailCorrect: { answer: false, isCritical: undefined },
    sumInsured: { answer: true, isCritical: undefined },
  });
});

test('Should titleTextInAllLanguages return correct text', () => {
  const getTitle = titleTextInAllLanguages();
  expect(getTitle).toContainEqual('policyholdertitle.assistantprofessor');
});

test('Should disable vehicle edit questions when vehicle edit policy denies QC editing', () => {
  const questionConfig = generateQuestionConfig(
    OrderDetail as unknown as OrderDataResponse
  );

  const result = applyVehicleEditPolicy(questionConfig, false);

  expect(
    questionConfig.vehicle.some((question: any) => question.isEditable)
  ).toBe(true);
  expect(
    result.vehicle.every((question: any) => question.isEditable === false)
  ).toBe(true);
  expect(result.policyholder).toEqual(questionConfig.policyholder);
});

test('Should preserve original vehicle editability when vehicle edit policy allows QC editing', () => {
  const questionConfig = generateQuestionConfig(
    OrderDetail as unknown as OrderDataResponse
  );

  const result = applyVehicleEditPolicy(questionConfig, true, true);

  expect(result.vehicle).toEqual(questionConfig.vehicle);
});

test('Should keep model and OIC/driving purpose read-only when BROK-4710 is off', () => {
  const questionConfig = generateQuestionConfig(
    OrderDetail as unknown as OrderDataResponse
  );

  const result = applyVehicleEditPolicy(questionConfig, true, false);

  const model = result.vehicle.find(
    (q: { qId: string }) => q.qId === Questions.VEHICLE_MODEL
  );
  const oicDriving = result.vehicle.find(
    (q: { qId: string }) => q.qId === Questions.OIC_DRIVING_PURPOSE
  );
  expect(model?.isEditable).toBe(false);
  expect(oicDriving?.isEditable).toBe(false);
});
