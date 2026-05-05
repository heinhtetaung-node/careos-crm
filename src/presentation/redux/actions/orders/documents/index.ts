import { IAction } from 'shared/interfaces/common';

export enum OrdersDocumentsActions {
  GET_ORDERS_DOCUMENTS = '[Order] GET_ORDERS_DOCUMENTS',
  GET_ORDERS_DOCUMENTS_SUCCESS = '[Order] GET_ORDERS_DOCUMENTS_SUCCESS ',
  GET_ORDERS_DOCUMENTS_FAILED = '[Order] GET_ORDERS_DOCUMENTS_FAILED',
  UPDATE_ORDER_LIST = '[Order] UPDATE_ORDER_DOCUMENT_LIST',
  RESET_PAGE_STATE = '[Order] GET_ORDERS_DOCUMENTS_RESET_ALL',
}

export const getOrdersDocuments = (payload?: any): IAction<any> => ({
  type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS,
  payload,
});

export const getOrdersDocumentsSuccess = (payload?: any): IAction<any> => ({
  type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_SUCCESS,
  payload,
});

export const getOrdersDocumentsFailed = (payload?: any): IAction<any> => ({
  type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_FAILED,
  payload,
});

export const updateAssigneeOrderDocumentList = (
  payload?: any
): IAction<any> => ({
  type: OrdersDocumentsActions.UPDATE_ORDER_LIST,
  payload,
});

export const resetPageStates = (): IAction<any> => ({
  type: OrdersDocumentsActions.RESET_PAGE_STATE,
});
