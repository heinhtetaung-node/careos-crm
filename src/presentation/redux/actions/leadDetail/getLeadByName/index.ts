import { IAction } from 'shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadDetailGetLeadActionTypes {
  GET_LEAD = '[LeadsDetail] GET_LEAD',
  GET_LEAD_SUCCESS = '[LeadsDetail] GET_LEAD_SUCCESS',
  GET_LEAD_FAIL = '[LeadsDetail] GET_LEAD_FAIL',
}

export const getLead = (payload?: any): IAction<any> => ({
  type: LeadDetailGetLeadActionTypes.GET_LEAD,
  payload,
});

export const getLeadSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailGetLeadActionTypes.GET_LEAD_SUCCESS,
  payload,
});

export const getLeadFail = (payload?: any): IAction<any> => ({
  type: LeadDetailGetLeadActionTypes.GET_LEAD_FAIL,
  payload,
});
