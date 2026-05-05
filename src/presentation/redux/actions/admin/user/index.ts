import {
  ICreateUser,
  IHandleTeamMember,
  IGetTeamByUser,
  ITeamInfo,
} from 'shared/interfaces/common/admin/user';

import { IAction } from '../../../../../shared/interfaces/common';
import PresentationUserModel from '../../../../models/customer/user';
//
export enum UserActionTypes {
  GET_USERS = '[User] GET_USERS',
  GET_USERS_SUCCESS = '[User] GET_USERS_SUCCESS',
  GET_USERS_FAILED = '[User] GET_USERS_FAILED',

  GET_TEAM_BY_USER = '[User] GET_TEAM_BY_USER',
  GET_TEAM_BY_USER_SUCCESS = '[User] GET_TEAM_BY_USER_SUCCESS',
  GET_TEAM_BY_USER_FAILED = '[User] GET_TEAM_BY_USER_FAILED',

  GET_TEAM_INFO = '[User] GET_TEAM_INFO',
  GET_TEAM_INFO_SUCCESS = '[User] GET_TEAM_INFO_SUCCESS',
  GET_TEAM_INFO_FAILED = '[User] GET_TEAM_INFO_FAILED',

  CREATE_USER = '[User] CREATE_USER',
  CREATE_USER_SUCCESS = '[User] CREATE_USER_SUCCESS',
  CREATE_USER_FAILED = '[User] CREATE_USER_FAILED',

  EDIT_USER = '[User] EDIT_USER',
  EDIT_USER_SUCCESS = '[User] EDIT_USER_SUCCESS',
  EDIT_USER_FAILED = '[User] EDIT_USER_FAILED',

  ADD_USER_TO_TEAM = '[User] ADD_USER_TO_TEAM',
  ADD_USER_TO_TEAM_SUCCESS = '[User] ADD_USER_TO_TEAM_SUCCESS',
  ADD_USER_TO_TEAM_FAILED = '[User] ADD_USER_TO_TEAM_FAILED',

  MOVE_USER = '[User] MOVE_USER',
  MOVE_USER_SUCCESS = '[User] MOVE_USER_SUCCESS',
  MOVE_USER_FAILED = '[User] MOVE_USER_FAILED',

  DELETE_USER_MEMBERSHIP = '[User] DELETE_USER_MEMBERSHIP',
  DELETE_USER_MEMBERSHIP_SUCCESS = '[User] DELETE_USER_MEMBERSHIP_SUCCESS',
  DELETE_USER_MEMBERSHIP_FAILED = '[User] DELETE_USER_MEMBERSHIP_FAILED',

  DELETE_USER = '[User] DELETE_USER',
  DELETE_USER_SUCCESS = '[User] DELETE_USER_SUCCESS',
  DELETE_USER_FAILED = '[User] DELETE_USER_FAILED',

  UNDELETE_USER = '[User] UNDELETE_USER',
  UNDELETE_USER_SUCCESS = '[User] UNDELETE_USER_SUCCESS',
  UNDELETE_USER_FAILED = '[User] UNDELETE_USER_FAILED',

  FILTER_USER = '[User] FILTER_USER',
  CLEAR_PRODUCT = '[User] CLEAR_PRODUCT',

  GET_LIST_CREATED_BY = '[User] GET_LIST_CREATED_BY',
  GET_LIST_CREATED_BY_SUCCESS = '[User] GET_LIST_CREATED_BY_SUCCESS',
  GET_LIST_CREATED_BY_FAILED = '[User] GET_LIST_CREATED_BY_FAILED',

  IMPORT_USER = '[User] IMPORT_USER',
  IMPORT_USER_SUCCESS = '[User] IMPORT_USER_SUCCESS',
  IMPORT_USER_FAILED = '[User] IMPORT_USER_FAILED',

  SET_IMPORT_USER_FLAG = '[USER] SET_IMPORT_USER_FLAG',

  GET_LOOKUP_USER = '[User] GET_LOOKUP_USER',
  GET_LOOKUP_USER_SUCCESS = '[User] GET_LOOKUP_USER_SUCCESS',
  GET_LOOKUP_USER_FAILED = '[User] GET_LOOKUP_USER_FAILED',
}

export const getUsers = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_USERS,
  payload,
});

export const getUsersSuccess = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_USERS_SUCCESS,
  payload,
});

export const getUsersFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_USERS_FAILED,
  payload,
});

export const getTeamByUser = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_BY_USER,
  payload,
});

export const getTeamByUserSuccess = (
  payload?: IGetTeamByUser
): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_BY_USER_SUCCESS,
  payload,
});

export const getTeamByUserFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_BY_USER_SUCCESS,
  payload,
});

export const getTeamInfo = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_INFO,
  payload,
});

export const getTeamInfoSuccess = (payload?: ITeamInfo): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_INFO_SUCCESS,
  payload,
});

export const getTeamInfoFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_TEAM_INFO_SUCCESS,
  payload,
});

// Create user
export const createUser = (
  payload: ICreateUser,
  isSaleAgent: boolean,
  isBackOffice: boolean,
  team?: string
): IAction<ICreateUser> => ({
  type: UserActionTypes.CREATE_USER,
  payload,
  isSaleAgent,
  isBackOffice,
  team,
});

export const createUserSuccess = (
  payload: PresentationUserModel
): IAction<PresentationUserModel> => ({
  type: UserActionTypes.CREATE_USER_SUCCESS,
  payload,
});

export const createUserFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.CREATE_USER_FAILED,
  error,
});

export const editUser = (
  payload: ICreateUser,
  condition: any
): IAction<ICreateUser> => ({
  type: UserActionTypes.EDIT_USER,
  payload,
  condition,
});

export const editUserSuccess = (
  payload: PresentationUserModel
): IAction<PresentationUserModel> => ({
  type: UserActionTypes.EDIT_USER_SUCCESS,
  payload,
});

export const editUserFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.EDIT_USER_FAILED,
  error,
});

export const addUserToTeam = (payload: IHandleTeamMember): IAction<any> => ({
  type: UserActionTypes.ADD_USER_TO_TEAM,
  payload,
});

export const addUserToTeamSuccess = (payload: any): IAction<any> => ({
  type: UserActionTypes.ADD_USER_TO_TEAM_SUCCESS,
  payload,
});

export const addUserToTeamFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.ADD_USER_TO_TEAM_FAILED,
  error,
});

export const moveUserToTeam = (payload: IHandleTeamMember): IAction<any> => ({
  type: UserActionTypes.MOVE_USER,
  payload,
});

export const moveUserToTeamSuccess = (payload: any): IAction<any> => ({
  type: UserActionTypes.MOVE_USER_SUCCESS,
  payload,
});

export const moveUserToTeamFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.MOVE_USER_FAILED,
  error,
});

export const deleteUserMembership = (payload: string): IAction<any> => ({
  type: UserActionTypes.DELETE_USER_MEMBERSHIP,
  payload,
});

export const deleteUserMembershipSuccess = (payload: any): IAction<any> => ({
  type: UserActionTypes.DELETE_USER_MEMBERSHIP_SUCCESS,
  payload,
});

export const deleteUserMembershipFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.DELETE_USER_MEMBERSHIP_FAILED,
  error,
});

export const deleteUser = (payload: string): IAction<any> => ({
  type: UserActionTypes.DELETE_USER,
  payload,
});

export const deleteUserSuccess = (payload: any): IAction<any> => ({
  type: UserActionTypes.DELETE_USER_SUCCESS,
  payload,
});

export const deleteUserFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.DELETE_USER_FAILED,
  error,
});

export const unDeleteUser = (payload: string): IAction<any> => ({
  type: UserActionTypes.UNDELETE_USER,
  payload,
});

export const unDeleteUserSuccess = (payload: any): IAction<any> => ({
  type: UserActionTypes.UNDELETE_USER_SUCCESS,
  payload,
});

export const unDeleteUserFailed = (error: any): IAction<any> => ({
  type: UserActionTypes.UNDELETE_USER_FAILED,
  error,
});

export const clearProduct = (): IAction<any> => ({
  type: UserActionTypes.CLEAR_PRODUCT,
});

export const filterUser = (
  payload: string,
  showDeleted?: boolean
): IAction<any> => ({
  type: UserActionTypes.FILTER_USER,
  payload,
  showDeleted,
});

export const getListCreatedBy = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_LIST_CREATED_BY,
  payload,
});

export const getListCreatedBySuccess = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_LIST_CREATED_BY_SUCCESS,
  payload,
});

export const getListCreatedByFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_LIST_CREATED_BY_FAILED,
  payload,
});

export const importUser = (): IAction<any> => ({
  type: UserActionTypes.IMPORT_USER,
});

export const importUserSuccess = (payload: string): IAction<any> => ({
  type: UserActionTypes.IMPORT_USER_SUCCESS,
  payload,
});

export const importUserFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.IMPORT_USER_FAILED,
  payload,
});

export const setImportUserFlag = (payload: string): IAction<any> => ({
  type: UserActionTypes.SET_IMPORT_USER_FLAG,
  payload,
});

export const getLookUpUser = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_LOOKUP_USER,
  payload,
});

export const getLookUpUsersSuccess = (payload?: any): IAction<any> => ({
  type: UserActionTypes.GET_LOOKUP_USER_SUCCESS,
  payload,
});

export const getLookUpUserFailed = (payload?: string): IAction<any> => ({
  type: UserActionTypes.GET_LOOKUP_USER_FAILED,
  payload,
});
