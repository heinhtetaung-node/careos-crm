import PresentationTeamModel from 'presentation/models/typeSelector/team';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';
import { IGetTeamList } from 'shared/interfaces/common/typeSelector/team';

import { IAction } from '../../../../../shared/interfaces/common';

// Get Team Selector Types
export enum TeamSelectorActionTypes {
  GET_TEAM_TYPES = '[TeamSelector] GET_TEAM_TYPES',
  GET_TEAM_TYPES_SUCCESS = '[TeamSelector] GET_TEAM_TYPES_SUCCESS',
  GET_TEAM_TYPES_FAIL = '[TeamSelector] GET_TEAM_TYPES_FAIL',

  GET_ALL_TEAMS = '[User] GET_ALL_TEAMS',
  GET_ALL_TEAMS_SUCCESS = '[User] GET_ALL_TEAMS_SUCCESS',
  GET_ALL_TEAMS_FAILED = '[User] GET_ALL_TEAMS_FAILED',
}

export enum TeamRoleSelectorActionTypes {
  GET_TEAM_ROLE_TYPES = '[RoleSelector] GET_TEAM_ROLE_TYPES',
  GET_TEAM_ROLE_TYPES_SUCCESS = '[RoleSelector] GET_TEAM_ROLE_TYPES_SUCCESS',
  GET_TEAM_ROLE_TYPES_FAIL = '[RoleSelector] GET_TEAM_ROLE_TYPES_FAIL',
}

export const getTeamSelectorTypes = (payload: IGetTeamList): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_TEAM_TYPES,
  payload,
});
export const getTeamSelectorTypesSuccess = (
  payload?: PresentationTeamModel
): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_TEAM_TYPES_SUCCESS,
  payload,
});

export const getTeamSelectorTypesFail = (payload?: string): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_TEAM_TYPES_FAIL,
  payload,
});

export const getAllTeams = (payload?: any): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_ALL_TEAMS,
  payload,
});

export const getAllTeamsSuccess = (payload?: any): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_ALL_TEAMS_SUCCESS,
  payload,
});

export const getAllTeamsFailed = (payload?: string): IAction<any> => ({
  type: TeamSelectorActionTypes.GET_ALL_TEAMS_FAILED,
  payload,
});

export const getTeamRoleSelector = (
  payload: IGetRoleSelector
): IAction<any> => ({
  type: TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES,
  payload,
});

export const getTeamRoleSelectorSuccess = (
  payload?: PresentationTeamModel
): IAction<any> => ({
  type: TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES_SUCCESS,
  payload,
});

export const getTeamRoleSelectorFail = (payload?: string): IAction<any> => ({
  type: TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES_FAIL,
  payload,
});
