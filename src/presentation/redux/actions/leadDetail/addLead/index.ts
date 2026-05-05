import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadDetailAddLeadActionTypes {
  ADD_LEAD = '[LeadsDetail] ADD_LEAD',
  ADD_LEAD_SUCCESS = '[LeadsDetail] ADD_LEAD_SUCCESS',
  ADD_LEAD_FAIL = '[LeadsDetail] ADD_LEAD_FAIL',
}

export const addLead = (payload?: any): IAction<any> => ({
  type: LeadDetailAddLeadActionTypes.ADD_LEAD,
  payload,
});

export const addLeadSuccess = (payload?: any): IAction<any> => ({
  type: LeadDetailAddLeadActionTypes.ADD_LEAD_SUCCESS,
  payload,
});

export const addLeadFail = (payload?: any): IAction<any> => ({
  type: LeadDetailAddLeadActionTypes.ADD_LEAD_FAIL,
  payload,
});
