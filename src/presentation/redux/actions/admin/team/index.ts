import { ICreateTeam } from 'shared/interfaces/common/admin/team';

import { IAction } from '../../../../../shared/interfaces/common';
import PresentationTeamModel from '../../../../models/customer/team';

export enum TeamActionTypes {
  CREATE_TEAM = '[Teams] CREATE_TEAM',
  CREATE_TEAM_SUCCESS = '[Teams] CREATE_TEAM_SUCCESS',
  CREATE_TEAM_FAIL = '[Teams] CREATE_TEAM_FAIL',

  GET_TEAMS = '[Teams] GET_TEAMS',
  GET_TEAMS_SUCCESS = '[Teams] GET_TEAMS_SUCCESS',
  GET_TEAMS_FAILED = '[Teams] GET_TEAMS_FAILED',

  GET_TEAMS_NAME = '[Teams] GET_TEAMS_NAME',
  GET_TEAMS_NAME_SUCCESS = '[Teams] GET_TEAMS_NAME_SUCCESS',
  GET_TEAMS_NAME_FAILED = '[Teams] GET_TEAMS_NAME_FAILED',

  EDIT_TEAM = '[TEAM] EDIT_TEAM',
  EDIT_TEAM_SUCCESS = '[TEAM] EDIT_TEAM_SUCCESS',
  EDIT_TEAM_FAILED = '[TEAM] EDIT_TEAM_FAILED',

  ADD_TEAM_FILTER = '[Teams] ADD_FILTER_TEAM',
}

export enum TeamDetailSelectorActionTypes {
  GET_TEAM_DETAIL_TYPES = '[TeamSelector] GET_TEAM_DETAIL_TYPES',
  GET_TEAM_DETAIL_TYPES_SUCCESS = '[TeamSelector] GET_TEAM_DETAIL_TYPES_SUCCESS',
  GET_TEAM_DETAIL_TYPES_FAIL = '[TeamSelector] GET_TEAM_DETAIL_TYPES_FAIL',
}

export const createTeam = (payload: any): IAction<any> => ({
  type: TeamActionTypes.CREATE_TEAM,
  payload,
});

export const createTeamSuccess = (payload: any): IAction<any> => ({
  type: TeamActionTypes.CREATE_TEAM_SUCCESS,
  payload,
});

export const createTeamFail = (error: any): IAction<any> => ({
  type: TeamActionTypes.CREATE_TEAM_FAIL,
  error,
});

export const getTeams = (payload?: any): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS,
  payload,
  userOption: { pageSize: 300, pageToken: '', showDeleted: true },
});

export const getTeamsSuccess = (payload?: any): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS_SUCCESS,
  payload,
});

export const getTeamsFailed = (payload?: string): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS_FAILED,
  payload,
});

export const editTeam = (
  payload: ICreateTeam,
  name: string
): IAction<ICreateTeam> => ({
  type: TeamActionTypes.EDIT_TEAM,
  name,
  payload,
});

export const editTeamSuccess = (
  payload: PresentationTeamModel
): IAction<PresentationTeamModel> => ({
  type: TeamActionTypes.EDIT_TEAM_SUCCESS,
  payload,
});

export const editTeamFailed = (error: any): IAction<any> => ({
  type: TeamActionTypes.EDIT_TEAM_FAILED,
  error,
});

export const addFilterTeams = (payload: string): IAction<any> => ({
  type: TeamActionTypes.ADD_TEAM_FILTER,
  payload,
});

export const getTeamsName = (payload?: any): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS_NAME,
  payload,
});

export const getTeamsNameSuccess = (payload?: any): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS_NAME_SUCCESS,
  payload,
});

export const getTeamsNameFailed = (payload?: string): IAction<any> => ({
  type: TeamActionTypes.GET_TEAMS_NAME_FAILED,
  payload,
});

export const getTeamDetailSelector = (payload: any): IAction<any> => ({
  type: TeamDetailSelectorActionTypes.GET_TEAM_DETAIL_TYPES,
  payload,
});

export const getTeamDetailSelectorSuccess = (payload?: any): IAction<any> => ({
  type: TeamDetailSelectorActionTypes.GET_TEAM_DETAIL_TYPES_SUCCESS,
  payload,
});

export const getTeamDetailSelectorFail = (payload?: string): IAction<any> => ({
  type: TeamDetailSelectorActionTypes.GET_TEAM_DETAIL_TYPES_FAIL,
  payload,
});
