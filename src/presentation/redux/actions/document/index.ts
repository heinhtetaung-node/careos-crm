import { IAction } from 'shared/interfaces/common';

export enum UploadDocumentActionTypes {
  UPLOAD_DOCUMENT = '[Document] UPLOAD_DOCUMENT',
  UPLOAD_DOCUMENT_SUCCESS = '[Document] UPLOAD_DOCUMENT_SUCCESS',
  UPLOAD_DOCUMENT_FAIL = '[Document] UPLOAD_DOCUMENT_FAIL',
}

export const uploadDocument = (payload: any): IAction<any> => ({
  type: UploadDocumentActionTypes.UPLOAD_DOCUMENT,
  payload,
});

export const uploadDocumentSuccess = (payload: any): IAction<any> => ({
  type: UploadDocumentActionTypes.UPLOAD_DOCUMENT_SUCCESS,
  payload,
});

export const uploadDocumentFail = (error: any): IAction<any> => ({
  type: UploadDocumentActionTypes.UPLOAD_DOCUMENT_FAIL,
  error,
});
