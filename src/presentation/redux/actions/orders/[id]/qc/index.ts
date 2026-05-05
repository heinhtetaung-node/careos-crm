import { Action } from 'redux';

export enum QcDetailAllActions {
  QC_GET_ALL_QUESTIONARIES = '[QC_DETAIL] QC_GET_ALL_QUESTIONARIES',
  QC_GET_ALL_QUESTIONARIES_SUCCESS = '[QC_DETAIL] QC_GET_ALL_QUESTIONARIES_SUCCESS',
  QC_QUESTION_APPROVE = '[QC_DETAIL] QC_QUESTION_APPROVE',
  QC_QUESTION_REJECT = '[QC_DETAIL] QC_QUESTION_REJECT',
}

type QcActionCreator<A, P extends keyof A> = (payload: A[P]) => A;

export interface QcGetAllQuestionaries extends Action {
  type: QcDetailAllActions.QC_GET_ALL_QUESTIONARIES;
  payload: any;
}

export interface QcQuestionApproveAction extends Action {
  type: QcDetailAllActions.QC_QUESTION_APPROVE;
  payload: {
    questionId: string;
  };
}

export interface QcQuestionRejectAction extends Action {
  type: QcDetailAllActions.QC_QUESTION_REJECT;
  payload: {
    questionId: string;
  };
}

export const getQcQuestionaries: QcActionCreator<
  QcGetAllQuestionaries,
  'payload'
> = (payload) => ({
  type: QcDetailAllActions.QC_GET_ALL_QUESTIONARIES,
  payload,
});

export const qcQuestionApprove: QcActionCreator<
  QcQuestionApproveAction,
  'payload'
> = (payload) => ({
  type: QcDetailAllActions.QC_QUESTION_APPROVE,
  payload,
});

export const qcQuestionReject: QcActionCreator<
  QcQuestionRejectAction,
  'payload'
> = (payload) => ({
  type: QcDetailAllActions.QC_QUESTION_REJECT,
  payload,
});
