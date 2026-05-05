import { OrderDocumentStatus } from 'shared/constants/orderType';
import { IAction } from 'shared/interfaces/common';

export enum OrderActionTypes {
  GET_DETAIL = '[Order] GET_DETAIL',
  GET_DETAIL_SUCCESS = '[Order] GET_DETAIL_SUCCESS',
  GET_DETAIL_FAILED = '[Order] GET_DETAIL_FAIL',

  UPDATE_ORDER = '[Order] UPDATE_ORDER',
  UPDATE_ORDER_SUCCESS = '[Order] UPDATE_ORDER_SUCCESS',
  UPDATE_ORDER_FAILED = '[Order] UPDATE_ORDER_FAIL',

  UPDATE_CUSTOMER = '[Order] UPDATE_CUSTOMER',
  UPDATE_CUSTOMER_SUCCESS = '[Order] UPDATE_CUSTOMER_SUCCESS',
  UPDATE_CUSTOMER_FAILED = '[Order] UPDATE_CUSTOMER_FAIL',

  UPDATE_DOCUMENT_STATUS = '[Order] UPDATE_DOCUMENT_STATUS',
  UPDATE_DOCUMENT_STATUS_SUCCESS = '[Order] UPDATE_DOCUMENT_STATUS_SUCCESS',
  UPDATE_DOCUMENT_STATUS_FAILED = '[Order] UPDATE_DOCUMENT_STATUS_FAIL',
}

export const getDetail = (payload: {
  orderName: string;
  isFetchCarDetails?: boolean;
}): IAction<any> => ({
  type: OrderActionTypes.GET_DETAIL,
  payload,
});

export const getDetailSuccess = (payload: any): IAction<any> => ({
  type: OrderActionTypes.GET_DETAIL_SUCCESS,
  payload,
});

export const getDetailFailed = (payload: string): IAction<any> => ({
  type: OrderActionTypes.GET_DETAIL_FAILED,
  payload,
});

export const updateOrder = (payload: any): IAction<any> => ({
  type: OrderActionTypes.UPDATE_ORDER,
  payload,
});

export const updateOrderSuccess = (payload: any): IAction<any> => ({
  type: OrderActionTypes.UPDATE_ORDER_SUCCESS,
  payload,
});

export const updateOrderFailed = (): IAction<any> => ({
  type: OrderActionTypes.UPDATE_ORDER_FAILED,
});

export const updateCustomer = (payload: Record<string, any>): IAction<any> => ({
  type: OrderActionTypes.UPDATE_CUSTOMER,
  payload,
});

export const updateCustomerSuccess = (payload: any): IAction<any> => ({
  type: OrderActionTypes.UPDATE_CUSTOMER_SUCCESS,
  payload,
});

export const updateCustomerFailed = (payload: string): IAction<any> => ({
  type: OrderActionTypes.UPDATE_CUSTOMER_FAILED,
  payload,
});

export const updateDocumentStatus = (payload: {
  status: OrderDocumentStatus | '';
}): IAction<any> => ({
  type: OrderActionTypes.UPDATE_DOCUMENT_STATUS,
  payload,
});

export const updateDocumentStatusSuccess = (payload: any): IAction<any> => ({
  type: OrderActionTypes.UPDATE_DOCUMENT_STATUS_SUCCESS,
  payload,
});

export const updateDocumentStatusFailed = (payload: string): IAction<any> => ({
  type: OrderActionTypes.UPDATE_DOCUMENT_STATUS_FAILED,
  payload,
});
