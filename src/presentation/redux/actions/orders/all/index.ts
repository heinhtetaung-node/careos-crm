import { Action } from 'redux';

import { IInsurerResponse } from 'presentation/redux/reducers/orders/all';
import { IAction } from 'shared/interfaces/common';

export enum OrdersAllActions {
  GET_ORDERS_ALL = '[Order] GET_ORDERS_ALL',
  GET_ORDERS_ALL_SUCCESS = '[Order] GET_ORDERS_ALL_SUCCESS ',
  GET_ORDERS_ALL_FAILED = '[Order] GET_ORDERS_ALL_FAILED',
  RESET_PAGE_STATE = '[Order] GET_ORDERS_ALL_RESET_ALL',
}

export enum InsurersAllActions {
  GET_INSURERS_ALL = '[Insurer] GET_INSURERS_ALL',
  GET_INSURERS_ALL_SUCCESS = '[Insurer] GET_INSURERS_ALL_SUCCESS',
  GET_INSURERS_ALL_FAILED = '[Insurer] GET_INSURERS_ALL_FAILED',
}

export const getOrdersAll = (payload?: any): IAction<any> => ({
  type: OrdersAllActions.GET_ORDERS_ALL,
  payload,
});

export const getOrdersAllSuccess = (payload?: any): IAction<any> => ({
  type: OrdersAllActions.GET_ORDERS_ALL_SUCCESS,
  payload,
});

export const getOrdersAllFailed = (payload?: any): IAction<any> => ({
  type: OrdersAllActions.GET_ORDERS_ALL_FAILED,
  payload,
});

export interface GetInsurerAllAction extends Action {
  type: InsurersAllActions.GET_INSURERS_ALL;
  payload: { pageSize: number; pageToken?: string };
}

export interface GetInsurerAllSuccessAction extends Action {
  type: InsurersAllActions.GET_INSURERS_ALL_SUCCESS;
  payload: IInsurerResponse;
}

export interface GetInsurerAllFailedAction extends Action {
  type: InsurersAllActions.GET_INSURERS_ALL_FAILED;
  payload: any;
}

export const getInsurersAll = (payload: {
  pageToken?: string;
  pageSize: number;
}): GetInsurerAllAction => ({
  type: InsurersAllActions.GET_INSURERS_ALL,
  payload,
});

export const getInsurersAllSuccess = (
  payload: IInsurerResponse
): GetInsurerAllSuccessAction => ({
  type: InsurersAllActions.GET_INSURERS_ALL_SUCCESS,
  payload,
});

export const getInsurersAllFailed = (
  payload?: any
): GetInsurerAllFailedAction => ({
  type: InsurersAllActions.GET_INSURERS_ALL_FAILED,
  payload,
});

export const resetPageStates = (): IAction<any> => ({
  type: OrdersAllActions.RESET_PAGE_STATE,
});
