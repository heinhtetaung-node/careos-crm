import { IAction } from '../../../../../shared/interfaces/common';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGIN_USER_FAILED = 'LOGIN_USER_FAILED';

export const LOGOUT_USER = 'LOGOUT_USER';
export const LOGOUT_USER_SUCCESS = 'LOGOUT_USER_SUCCESS';
export const LOGOUT_USER_FAILED = 'LOGOUT_USER_FAILED';

export interface ILoginPayload {
  email: string;
  password: string;
}

export const loginUser = (
  email: string,
  password: string
): IAction<ILoginPayload> => ({
  type: LOGIN_USER,
  payload: {
    email,
    password,
  },
});

export const loginUserSuccess = (payload?: string): IAction<string> => ({
  type: LOGIN_USER_SUCCESS,
  payload,
});

export const loginUserFailed = (error: any): IAction<any> => ({
  type: LOGIN_USER_FAILED,
  error,
});

export const logoutUser = (): IAction<any> => ({
  type: LOGOUT_USER,
});

export const logoutUserSuccess = (): IAction<any> => ({
  type: LOGOUT_USER_SUCCESS,
});

export const logoutUserFailed = (error: any): IAction<any> => ({
  type: LOGOUT_USER_FAILED,
  error,
});
