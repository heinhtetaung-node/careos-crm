import { IAction } from 'shared/interfaces/common';

export enum GetCarDetailActionTypes {
  GET_CAR_DETAIL = '[Car] GET_CAR_DETAIL',
  GET_CAR_DETAIL_SUCCESS = '[Car] GET_CAR_DETAIL_SUCCESS',
  GET_CAR_DETAIL_FAIL = '[Car] GET_CAR_DETAIL_FAIL',
}

export const getCarDetail = (payload?: any): IAction<any> => ({
  type: GetCarDetailActionTypes.GET_CAR_DETAIL,
  payload,
});

export const getCarDetailSuccess = (payload?: any): IAction<any> => ({
  type: GetCarDetailActionTypes.GET_CAR_DETAIL_SUCCESS,
  payload,
});

export const getCarDetailFailed = (payload?: string): IAction<any> => ({
  type: GetCarDetailActionTypes.GET_CAR_DETAIL_FAIL,
  payload,
});
