import { IAction } from 'shared/interfaces/common';

export enum GetProvinceActionTypes {
  GET_PROVINCE_DETAIL = '[Province] GET_PROVINCE_DETAIL',
  GET_PROVINCE_DETAIL_SUCCESS = '[Province] GET_PROVINCE_DETAIL_SUCCESS',
  GET_PROVINCE_DETAIL_FAIL = '[Province] GET_PROVINCE_DETAIL_FAIL',
}

export const getProvince = (payload?: any): IAction<any> => ({
  type: GetProvinceActionTypes.GET_PROVINCE_DETAIL,
  payload,
});

export const getProvinceSuccess = (payload?: any): IAction<any> => ({
  type: GetProvinceActionTypes.GET_PROVINCE_DETAIL_SUCCESS,
  payload,
});

export const getProvinceFailed = (payload?: string): IAction<any> => ({
  type: GetProvinceActionTypes.GET_PROVINCE_DETAIL_FAIL,
  payload,
});
