import { IAction } from '../../../../../shared/interfaces/common';

export enum InsurersSelectorActionTypes {
  GET_ALL_INSURERS_TYPES = '[InsurersSelector] GET_ALL_INSURERS_TYPES',
  GET_ALL_INSURERS_TYPES_SUCCESS = '[InsurersSelector] GET_ALL_INSURERS_TYPES_SUCCESS',
  GET_ALL_INSURERS_TYPES_FAIL = '[InsurersSelector] GET_ALL_INSURERS_TYPES_FAIL',
}

export const getAllInsurersSelector = (payload: any): IAction<any> => ({
  type: InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES,
  payload,
});

export const getAllInsurersSelectorSuccess = (payload?: any): IAction<any> => ({
  type: InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES_SUCCESS,
  payload,
});

export const getAllInsurersSelectorFail = (payload?: string): IAction<any> => ({
  type: InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES_FAIL,
  payload,
});
