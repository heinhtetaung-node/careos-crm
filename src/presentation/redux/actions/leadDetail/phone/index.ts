import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadPhoneActionTypes {
  ADD_PHONE = '[LeadsDetail] ADD_PHONE',
  ADD_PHONE_SUCCESS = '[LeadsDetail] ADD_PHONE_SUCCESS',
  ADD_PHONE_FAIL = '[LeadsDetail] ADD_PHONE_FAIL',
}

export const addPhone = (payload?: any): IAction<any> => ({
  type: LeadPhoneActionTypes.ADD_PHONE,
  payload,
});

export const addPhoneSuccess = (payload?: any): IAction<any> => ({
  type: LeadPhoneActionTypes.ADD_PHONE_SUCCESS,
  payload,
});

export const addPhoneFail = (payload?: any): IAction<any> => ({
  type: LeadPhoneActionTypes.ADD_PHONE_FAIL,
  payload,
});
