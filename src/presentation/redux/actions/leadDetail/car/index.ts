import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadCarActionTypes {
  GET_CAR_BRAND = '[LeadsDetail] GET_CAR_BRAND',
  GET_CAR_BRAND_SUCCESS = '[LeadsDetail] GET_CAR_BRAND_SUCCESS',
  GET_CAR_BRAND_FAIL = '[LeadsDetail] GET_CAR_BRAND_FAIL',
  GET_CAR_MODEL = '[LeadsDetail] GET_CAR_MODEL',
  GET_CAR_MODEL_SUCCESS = '[LeadsDetail] GET_CAR_MODEL_SUCCESS',
  GET_CAR_MODEL_FAIL = '[LeadsDetail] GET_CAR_MODEL_FAIL',
  GET_CAR_BY_SUB_MODEL_YEAR = '[LeadsDetail] GET_CAR_BY_SUB_MODEL_YEAR',
  GET_CAR_BY_SUB_MODEL_YEAR_SUCCESS = '[LeadsDetail] GET_CAR_BY_SUB_MODEL_YEAR_SUCCESS',
  GET_CAR_BY_SUB_MODEL_YEAR_FAIL = '[LeadsDetail] GET_CAR_BY_SUB_MODEL_YEAR_FAIL',
}

export const getCarBrand = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BRAND,
  payload,
});

export const getCarBrandSuccess = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BRAND_SUCCESS,
  payload,
});

export const getCarBrandFail = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BRAND_FAIL,
  payload,
});
export const getCarModel = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_MODEL,
  payload,
});

export const getCarModelSuccess = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_MODEL_SUCCESS,
  payload,
});

export const getCarModelFail = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_MODEL_FAIL,
  payload,
});
export const getCarBySubModelYear = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BY_SUB_MODEL_YEAR,
  payload,
});

export const getCarBySubModelYearSuccess = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BY_SUB_MODEL_YEAR_SUCCESS,
  payload,
});

export const getCarBySubModelYearFail = (payload?: any): IAction<any> => ({
  type: LeadCarActionTypes.GET_CAR_BY_SUB_MODEL_YEAR_FAIL,
  payload,
});
