import { IAction } from 'shared/interfaces/common';

export enum LeadDetailUpdateLeadDataActionTypes {
  UPDATE_LEAD_DATA = '[LeadDetail] UPDATE_LEAD_DATA',
  UPDATE_LEAD_DATA_SUCCESS = '[LeadDetail] UPDATE_LEAD_DATA_SUCCESS',
  UPDATE_LEAD_DATA_FAILED = '[LeadDetail] UPDATE_LEAD_DATA_FAILED',
}

export const updateLead = (payload?: any): IAction<any> => ({
  type: LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA,
  payload,
});

export const updateLeadSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_SUCCESS,
  payload,
});

export const updateLeadFailed = (error: string): IAction<any> => ({
  type: LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_FAILED,
  error,
});
