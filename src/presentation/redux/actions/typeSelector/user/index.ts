import PresentationUserModel from 'presentation/models/typeSelector/user';
import { IGetUserList } from 'shared/interfaces/common/typeSelector/user';

import { IAction } from '../../../../../shared/interfaces/common';

// Get User Selector Types
export enum UserSelectorActionTypes {
  GET_USER_TYPES = '[UserSelector] GET_USER_TYPES',
  GET_USER_TYPES_SUCCESS = '[UserSelector] GET_USER_TYPES_SUCCESS',
  GET_USER_TYPES_FAIL = '[UserSelector] GET_USER_TYPES_FAIL',

  GET_MANAGER_USER_TYPES = '[UserSelector] GET_MANAGER_USER_TYPES',
  GET_MANAGER_USER_TYPES_SUCCESS = '[UserSelector] GET_MANAGER_USER_TYPES_SUCCESS',
  GET_MANAGER_USER_TYPES_FAIL = '[UserSelector] GET_MANAGER_USER_TYPES_FAIL',

  GET_SUPERVISOR_USER_TYPES = '[UserSelector]  GET_SUPERVISOR_USER_TYPES',
  GET_SUPERVISOR_USER_TYPES_SUCCESS = '[UserSelector] GET_SUPERVISOR_USER_TYPES_SUCCESS',
  GET_SUPERVISOR_USER_TYPES_FAIL = '[UserSelector] GET_SUPERVISOR_USER_TYPES_FAIL',
}

export const getUserSelectorTypes = (payload: IGetUserList): IAction<any> => ({
  type: UserSelectorActionTypes.GET_USER_TYPES,
  payload,
});
export const getUserSelectorTypesSuccess = (
  payload?: PresentationUserModel
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_USER_TYPES_SUCCESS,
  payload,
});

export const getUserSelectorTypesFail = (payload?: string): IAction<any> => ({
  type: UserSelectorActionTypes.GET_USER_TYPES_FAIL,
  payload,
});

export const getManagerUserSelectorTypes = (
  payload: IGetUserList
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_MANAGER_USER_TYPES,
  payload,
});
export const getManagerUserSelectorTypesSuccess = (
  payload?: PresentationUserModel
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_MANAGER_USER_TYPES_SUCCESS,
  payload,
});

export const getManagerUserSelectorTypesFail = (
  payload?: string
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_MANAGER_USER_TYPES_FAIL,
  payload,
});

export const getSupervisorUserSelectorTypes = (
  payload: IGetUserList
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_SUPERVISOR_USER_TYPES,
  payload,
});
export const getSupervisorUserSelectorTypesSuccess = (
  payload?: PresentationUserModel
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_SUPERVISOR_USER_TYPES_SUCCESS,
  payload,
});

export const getSupervisorUserSelectorTypesFail = (
  payload?: string
): IAction<any> => ({
  type: UserSelectorActionTypes.GET_SUPERVISOR_USER_TYPES_FAIL,
  payload,
});
