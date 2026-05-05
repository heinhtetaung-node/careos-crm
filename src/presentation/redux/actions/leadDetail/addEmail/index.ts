import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadAddEmailActionTypes {
  ADD_EMAIL = '[LeadsDetail] ADD_EMAIL',
  ADD_EMAIL_SUCCESS = '[LeadsDetail] ADD_EMAIL_SUCCESS',
  ADD_EMAIL_FAIL = '[LeadsDetail] ADD_EMAIL_FAIL',
  REPLY_EMAIL = '[LeadsDetail] REPLY_EMAIL',
}

export const addEmail = (payload?: any): IAction<any> => ({
  type: LeadAddEmailActionTypes.ADD_EMAIL,
  payload,
});

export const addEmailSuccess = (payload?: any): IAction<any> => ({
  type: LeadAddEmailActionTypes.ADD_EMAIL_SUCCESS,
  payload,
});

export const addEmailFail = (payload?: any): IAction<any> => ({
  type: LeadAddEmailActionTypes.ADD_EMAIL_FAIL,
  payload,
});

export const replyEmail = (payload?: any): IAction<any> => ({
  type: LeadAddEmailActionTypes.REPLY_EMAIL,
  payload,
});
