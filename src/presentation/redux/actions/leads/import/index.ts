import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadActionTypes {
  GET_IMPORT_LEADS = '[Leads] GET_IMPORT_LEADS',
  GET_IMPORT_LEADS_SUCCESS = '[Leads] GET_IMPORT_LEADS_SUCCESS',
  GET_IMPORT_LEADS_FAILED = '[Leads] GET_IMPORT_LEADS_FAILED',
  GET_DOWNLOAD_LINK_BY_NAME = '[Leads] GET_DOWNLOAD_LINK_BY_NAME',
  GET_DOWNLOAD_LINK_BY_NAME_SUCCESS = '[Leads] GET_DOWNLOAD_LINK_BY_NAME_SUCCESS',
  GET_DOWNLOAD_LINK_BY_NAME_FAILED = '[Leads] GET_DOWNLOAD_LINK_BY_NAME_FAILED',
}

export const getImportLead = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_IMPORT_LEADS,
  payload,
});

export const getImportLeadSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.GET_IMPORT_LEADS_SUCCESS,
  payload,
});

export const getImportLeadFailed = (error: string): IAction<any> => ({
  type: LeadActionTypes.GET_IMPORT_LEADS_FAILED,
  error,
});
