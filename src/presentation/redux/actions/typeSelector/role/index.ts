import PresentationRoleModel from 'presentation/models/typeSelector/role';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';

import { IAction } from '../../../../../shared/interfaces/common';

// Get Role Selector Types
export enum RoleSelectorActionTypes {
  GET_ROLE_TYPES = '[RoleSelector] GET_ROLE_TYPES',
  GET_ROLE_TYPES_SUCCESS = '[RoleSelector] GET_ROLE_TYPES_SUCCESS',
  GET_ROLE_TYPES_FAIL = '[RoleSelector] GET_ROLE_TYPES_FAIL',
}

export const getRoleSelectorTypes = (
  payload: IGetRoleSelector
): IAction<any> => ({
  type: RoleSelectorActionTypes.GET_ROLE_TYPES,
  payload,
});
export const getRoleSelectorTypesSuccess = (
  payload?: PresentationRoleModel
): IAction<any> => ({
  type: RoleSelectorActionTypes.GET_ROLE_TYPES_SUCCESS,
  payload,
});

export const getRoleSelectorTypesFail = (payload?: string): IAction<any> => ({
  type: RoleSelectorActionTypes.GET_ROLE_TYPES_FAIL,
  payload,
});
