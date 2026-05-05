import { IAction } from 'shared/interfaces/common';

export enum UserActionTypes {
  GET_MY_LEADS = '[My Leads] GET_MY_LEADS',
}

export const getMyLeads = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_MY_LEADS,
  payload,
});
