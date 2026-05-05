import { IAction } from 'shared/interfaces/common';

export enum LeadRejectionActionTypes {
  LEAD_REJECTION = '[LeadsDetail] LEAD_REJECTION',
  LEAD_REJECTION_SUCCESS = '[LeadsDetail] LEAD_REJECTION_SUCCESS',
  LEAD_REJECTION_FAIL = '[LeadsDetail] LEAD_REJECTION_FAIL',
}

export const leadRejection = (payload?: any): IAction<any> => ({
  type: LeadRejectionActionTypes.LEAD_REJECTION,
  payload,
});

export const leadRejectionSuccess = (payload?: any): IAction<any> => ({
  type: LeadRejectionActionTypes.LEAD_REJECTION_SUCCESS,
  payload,
});

export const leadRejectionFail = (payload?: any): IAction<any> => ({
  type: LeadRejectionActionTypes.LEAD_REJECTION_FAIL,
  payload,
});
