import { IAction } from '../../../../../shared/interfaces/common';

export const INIT_APP = 'INIT_APP';
export const INIT_APP_SUCCESS = 'REQUEST_APP_CONFIGURATIONS_SUCCESS';
export const INIT_APP_FAILED = 'REQUEST_APP_CONFIGURATIONS_FAILED';

// Get site config
export const GET_ALL = 'GET_ALL';
export const GET_ALL_SUCCESS = 'GET_ALL_SUCCESS';
export const GET_ALL_FAILED = 'GET_ALL_FAILED';

export const initApplication = (): IAction<any> => ({
  type: INIT_APP,
});

export const initApplicationSuccess = (payload?: any): IAction<any> => ({
  type: INIT_APP_SUCCESS,
  payload,
});

export const initApplicationFailed = (error: any): IAction<any> => ({
  type: INIT_APP_FAILED,
  error,
});

export const getAll = (): IAction<any> => ({
  type: GET_ALL,
});

export const getAllSuccess = (payload?: any): IAction<any> => ({
  type: GET_ALL_SUCCESS,
  payload,
});

export const getAllFailed = (error: any): IAction<any> => ({
  type: GET_ALL_FAILED,
  error,
});
