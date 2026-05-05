import { IAction } from 'shared/interfaces/common';

export enum UpdateLeadImportantActionTypes {
  UPDATE_LEAD_IMPORTANT = '[LeadDetail] UPDATE_LEAD_IMPORTANT',
  UPDATE_LEAD_IMPORTANT_SUCCESS = '[LeadDetail] UPDATE_LEAD_IMPORTANT_SUCCESS',
  UPDATE_LEAD_IMPORTANT_FAILED = '[LeadDetail] UPDATE_LEAD_IMPORTANT_FAILED',
}

export const updateLeadImportant = (payload?: any): IAction<any> => ({
  type: UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT,
  payload,
});

export const updateLeadImportantSuccess = (payload?: any): IAction<any> => ({
  type: UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT_SUCCESS,
  payload,
});

export const updateLeadImportantFailed = (error: string): IAction<any> => ({
  type: UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT_FAILED,
  error,
});
