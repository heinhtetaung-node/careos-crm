import { IAction } from 'shared/interfaces/common';

export enum OrderSubmissionActions {
  GET_ORDER_SUBMISSION = '[Order] GET_ORDER_SUBMISSION',
  GET_ORDER_SUBMISSION_SUCCESS = '[Order] GET_ORDER_SUBMISSION_SUCCESS',
  GET_ORDER_SUBMISSION_FAILED = '[Order] GET_ORDER_SUBMISSION_FAILED',
  UPDATE_ORDER_LIST = '[Order] UPDATE_ORDER_SUBMISSION_LIST',
  RESET_PAGE_STATE = '[Order] GET_ORDERS_SUBMISSION_RESET_ALL',
}

export const getOrderSubmission = (payload?: any): IAction<any> => ({
  type: OrderSubmissionActions.GET_ORDER_SUBMISSION,
  payload,
});

export const getOrderSubmissionSuccess = (payload?: any): IAction<any> => ({
  type: OrderSubmissionActions.GET_ORDER_SUBMISSION_SUCCESS,
  payload,
});

export const getOrderSubmissionFailed = (payload?: any): IAction<any> => ({
  type: OrderSubmissionActions.GET_ORDER_SUBMISSION_FAILED,
  payload,
});

export const updateAssigneeOrderSubmissionList = (
  payload?: any
): IAction<any> => ({
  type: OrderSubmissionActions.UPDATE_ORDER_LIST,
  payload,
});

export const resetPageStates = (): IAction<any> => ({
  type: OrderSubmissionActions.RESET_PAGE_STATE,
});
