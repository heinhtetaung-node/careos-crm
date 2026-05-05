import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads Detail Information
export enum LeadCustomerDetailActionTypes {
  UPDATE_CUSTOMER_DETAIL = '[LeadsDetail] UPDATE_CUSTOMER_DETAIL',
  UPDATE_CUSTOMER_DETAIL_SUCCESS = '[LeadsDetail] UPDATE_CUSTOMER_DETAIL_SUCCESS',
  UPDATE_CUSTOMER_DETAIL_FAIL = '[LeadsDetail] UPDATE_CUSTOMER_DETAIL_FAIL',
}

export const updateCustomerDetail = (payload?: any): IAction<any> => ({
  type: LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL,
  payload,
});

export const updateCustomerDetailSuccess = (payload?: any): IAction<any> => ({
  type: LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL_SUCCESS,
  payload,
});

export const updateCustomerDetailFail = (payload?: any): IAction<any> => ({
  type: LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL_FAIL,
  payload,
});
