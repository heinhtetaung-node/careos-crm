import { IAction } from 'shared/interfaces/common';

export enum LeadDetailUpdateLeadStatusActionTypes {
  UPDATE_LEAD_STATUS = '[LeadDetail] UPDATE_LEAD_STATUS',
  UPDATE_LEAD_STATUS_SUCCESS = '[LeadDetail] UPDATE_LEAD_STATUS_SUCCESS',
  UPDATE_LEAD_STATUS_FAILED = '[LeadDetail] UPDATE_LEAD_STATUS_FAILED',
}

export const updateLeadStatus = (payload?: any): IAction<any> => ({
  type: LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS,
  payload,
});

export const updateLeadStatusSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS_SUCCESS,
  payload,
});

export const updateLeadStatusFailed = (error: string): IAction<any> => ({
  type: LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS_FAILED,
  error,
});
