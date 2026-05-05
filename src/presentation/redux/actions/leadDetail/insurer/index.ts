import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadInsurerActionTypes {
  GET_LIST_INSURER = '[LeadsDetail] GET_LIST_INSURER',
  GET_LIST_INSURER_SUCCESS = '[LeadsDetail] GET_LIST_INSURER_SUCCESS',
  GET_LIST_INSURER_FAIL = '[LeadsDetail] GET_LIST_INSURER_FAIL',
}

export const getListInsurer = (payload?: any): IAction<any> => ({
  type: LeadInsurerActionTypes.GET_LIST_INSURER,
  payload,
});

export const getListInsurerSuccess = (payload?: any): IAction<any> => ({
  type: LeadInsurerActionTypes.GET_LIST_INSURER_SUCCESS,
  payload,
});

export const getListInsurerFail = (payload?: any): IAction<any> => ({
  type: LeadInsurerActionTypes.GET_LIST_INSURER_FAIL,
  payload,
});
