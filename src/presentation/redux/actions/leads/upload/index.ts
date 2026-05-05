import { IAction } from 'shared/interfaces/common';

export enum UploadActionTypes {
  CREATE_DOCUMENTS_LEADS = '[Leads] CREATE_DOCUMENTS_LEADS',
  CREATE_DOCUMENTS_LEADS_SUCCESS = '[Leads] CREATE_DOCUMENTS_LEADS_SUCCESS',
  CREATE_DOCUMENTS_LEADS_FAILED = '[Leads] CREATE_DOCUMENTS_LEADS_FAILED',
  DELETE_DOCUMENTS_LEADS = '[Leads] DELETE_DOCUMENTS_LEADS',
  DELETE_DOCUMENTS_LEADS_SUCCESS = '[Leads] DELETE_DOCUMENTS_LEADS_SUCCESS',
  DELETE_DOCUMENTS_LEADS_FAILED = '[Leads] DELETE_DOCUMENTS_LEADS_FAILED',
  GET_DOCUMENTS_LEADS = '[Leads] GET_DOCUMENTS_LEADS',
  GET_DOCUMENTS_LEADS_SUCCESS = '[Leads] GET_DOCUMENTS_LEADS_SUCCESS',
  GET_DOCUMENTS_LEADS_FAILED = '[Leads] GET_DOCUMENTS_LEADS_FAILED',
}

export const createDocumentLead = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.CREATE_DOCUMENTS_LEADS,
  payload,
});

export const createDocumentLeadSuccess = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.CREATE_DOCUMENTS_LEADS_SUCCESS,
  payload,
});

export const createDocumentLeadFailed = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.CREATE_DOCUMENTS_LEADS_FAILED,
  payload,
});

export const deleteDocumentLead = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.DELETE_DOCUMENTS_LEADS,
  payload,
});

export const deleteDocumentLeadSuccess = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.DELETE_DOCUMENTS_LEADS_SUCCESS,
  payload,
});

export const deleteDocumentLeadFailed = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.DELETE_DOCUMENTS_LEADS_FAILED,
  payload,
});

export const getDocumentLead = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.GET_DOCUMENTS_LEADS,
  payload,
});

export const getDocumentLeadSuccess = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.GET_DOCUMENTS_LEADS_SUCCESS,
  payload,
});

export const getDocumentLeadFailed = (payload?: any): IAction<any> => ({
  type: UploadActionTypes.GET_DOCUMENTS_LEADS_FAILED,
  payload,
});
