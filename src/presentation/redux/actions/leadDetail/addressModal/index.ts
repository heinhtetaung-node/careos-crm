import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadAddressActionTypes {
  ADD_ADDRESS = '[LeadsDetail] ADD_ADDRESS',
  ADD_ADDRESS_SUCCESS = '[LeadsDetail] ADD_ADDRESS_SUCCESS',
  ADD_ADDRESS_FAIL = '[LeadsDetail] ADD_ADDRESS_FAIL',
}

export const addAddress = (payload?: any): IAction<any> => ({
  type: LeadAddressActionTypes.ADD_ADDRESS,
  payload,
});

export const addAddressSuccess = (payload?: any): IAction<any> => ({
  type: LeadAddressActionTypes.ADD_ADDRESS_SUCCESS,
  payload,
});

export const addAddressFail = (payload?: any): IAction<any> => ({
  type: LeadAddressActionTypes.ADD_ADDRESS_FAIL,
  payload,
});
