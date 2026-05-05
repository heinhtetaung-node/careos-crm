import {
  ILeadSources,
  ICreateScore,
  ILeadScoreResponse,
} from 'shared/interfaces/common/lead/sources';

import { IAction } from '../../../../../shared/interfaces/common';

export enum LeadSourcesActionTypes {
  GET_LEAD_SOURCES = '[Leads] GET_LEAD_SOURCES',
  GET_LEAD_SOURCES_SUCCESS = '[Leads] GET_LEAD_SOURCES_SUCCESS',
  GET_LEAD_SOURCES_FAILED = '[Leads] GET_LEAD_SOURCES_FAILED',

  GET_LEAD_SOURCES_SCORE = '[Leads] GET_LEAD_SOURCES_SCORE',
  GET_LEAD_SOURCES_SCORE_SUCCESS = '[Leads] GET_LEAD_SOURCES_SCORE_SUCCESS',
  GET_LEAD_SOURCES_SCORE_FAILED = '[Leads] GET_LEAD_SOURCES_SCORE_FAILED',

  CREATE_LEAD_SOURCES = '[Leads] CREATE_LEAD_SOURCES',
  CREATE_LEAD_SOURCES_SUCCESS = '[Leads] CREATE_LEAD_SOURCES_SUCCESS',
  CREATE_LEAD_SOURCES_FAILED = '[Leads] CREATE_LEAD_SOURCES_FAILED',

  CREATE_LEAD_SOURCES_SCORE = '[Leads] CREATE_LEAD_SOURCES_SCORE',
  CREATE_LEAD_SOURCES_SCORE_SUCCESS = '[Leads] CREATE_LEAD_SOURCES_SCORE_SUCCESS',
  CREATE_LEAD_SOURCES_SCORE_FAILED = '[Leads] CREATE_LEAD_SOURCES_SCORE_FAILED',

  UPDATE_LEAD_SOURCES = '[Leads] UPDATE_LEAD_SOURCES',
  UPDATE_LEAD_SOURCES_SUCCESS = '[Leads] UPDATE_LEAD_SOURCES_SUCCESS',
  UPDATE_LEAD_SOURCES_FAILED = '[Leads] UPDATE_LEAD_SOURCES_FAILED',

  UPDATE_LEAD_SOURCES_SCORE = '[Leads] UPDATE_LEAD_SOURCES_SCORE',
  UPDATE_LEAD_SOURCES_SCORE_SUCCESS = '[Leads] UPDATE_LEAD_SOURCES_SCORE_SUCCESS',
  UPDATE_LEAD_SOURCES_SCORE_FAILED = '[Leads] UPDATE_LEAD_SOURCES_SCORE_FAILED',

  CLEAR_SOURCE_SCORE = '[Leads] CLEAR_SOURCE_SCORE',
  FILTER_SOURCE = '[Leads] FILTER_SOURCE',
}

export const getLeadSource = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES,
  payload,
});

export const getLeadSourceSuccess = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES_SUCCESS,
  payload,
});

export const getLeadSourceFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES_FAILED,
  error,
});

export const getLeadSourceScore = (payload?: string): IAction<string> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES_SCORE,
  payload,
});

export const getLeadSourceScoreSuccess = (
  payload?: ILeadScoreResponse
): IAction<ILeadScoreResponse> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES_SCORE_SUCCESS,
  payload,
});

export const getLeadSourceScoreFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.GET_LEAD_SOURCES_SCORE_FAILED,
  error,
});

export const createLeadSources = (
  payload?: ILeadSources,
  additionalParams?: any
): IAction<ILeadSources> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES,
  payload,
  additionalParams,
});

export const createLeadSourcesSuccess = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SUCCESS,
  payload,
});

export const createLeadSourcesFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES_FAILED,
  error,
});

export const createLeadSourcesScore = (
  payload?: ICreateScore
): IAction<ICreateScore> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SCORE,
  payload,
});

export const createLeadSourcesScoreSuccess = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SCORE_SUCCESS,
  payload,
});

export const createLeadSourcesScoreFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.CREATE_LEAD_SOURCES_SCORE_FAILED,
  error,
});

export const updateLeadSources = (
  payload?: ILeadSources,
  additionalParams?: any
): IAction<ILeadSources> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES,
  payload,
  additionalParams,
});

export const updateLeadSourcesSuccess = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SUCCESS,
  payload,
});

export const updateLeadSourcesFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_FAILED,
  error,
});

export const updateLeadSourceScore = (
  payload?: ICreateScore,
  scoreName?: string
): IAction<ICreateScore> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SCORE,
  payload,
  scoreName,
});

export const updateLeadSourceScoreSuccess = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SCORE_SUCCESS,
  payload,
});

export const updateLeadSourceScoreFailed = (error: string): IAction<any> => ({
  type: LeadSourcesActionTypes.UPDATE_LEAD_SOURCES_SCORE_FAILED,
  error,
});

export const clearSourceScore = (): IAction<any> => ({
  type: LeadSourcesActionTypes.CLEAR_SOURCE_SCORE,
});

export const filterSource = (payload?: any): IAction<any> => ({
  type: LeadSourcesActionTypes.FILTER_SOURCE,
  payload,
});
