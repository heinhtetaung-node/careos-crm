import { IAction } from 'shared/interfaces/common';

export enum CreateOrderDocumentActionTypes {
  CREATE_ORDER_DOCUMENT = '[Order] CREATE_ORDER_DOCUMENT',
  CREATE_ORDER_DOCUMENT_SUCCESS = '[Order] CREATE_ORDER_DOCUMENT_SUCCESS',
  CREATE_ORDER_DOCUMENT_FAIL = '[Order] CREATE_ORDER_DOCUMENT_FAIL',
  DELETE_ORDER_DOCUMENT = '[Order] DELETE_ORDER_DOCUMENT',
  DELETE_ORDER_DOCUMENT_SUCCESS = '[Order] DELETE_ORDER_DOCUMENT_SUCCESS',
  DELETE_ORDER_DOCUMENT_FAIL = '[Order] DELETE_ORDER_DOCUMENT_FAIL',
  GET_UPLOADED_DOCUMENTS = '[Order] GET_UPLOADED_DOCUMENTS',
  GET_UPLOADED_DOCUMENTS_SUCCESS = '[Order] GET_UPLOADED_DOCUMENTS_SUCCESS',
  GET_UPLOADED_DOCUMENTS_FAIL = '[Order] GET_UPLOADED_DOCUMENTS_FAIL',
}

export const createOrderDocument = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT,
  payload,
});

export const createOrderDocumentSuccess = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_SUCCESS,
  payload,
});

export const createOrderDocumentFail = (error: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.CREATE_ORDER_DOCUMENT_FAIL,
  error,
});

export const deleteDocument = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT,
  payload,
});

export const deleteDocumentSuccess = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_SUCCESS,
  payload,
});

export const deleteDocumentFail = (error: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.DELETE_ORDER_DOCUMENT_FAIL,
  error,
});

export const getUploadedDocuments = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS,
  payload,
});

export const getUploadedDocumentsSuccess = (payload: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_SUCCESS,
  payload,
});

export const getUploadedDocumentsFail = (error: any): IAction<any> => ({
  type: CreateOrderDocumentActionTypes.GET_UPLOADED_DOCUMENTS_FAIL,
  error,
});
