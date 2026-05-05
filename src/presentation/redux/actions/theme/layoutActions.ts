import { IHeaderRoutes } from 'presentation/routes/route.interface';
import { IAction } from 'shared/interfaces/common';

// Layout Action
export enum LayoutActionTypes {
  GET_LAYOUT_CONFIG = '[Layout] GET_LAYOUT_CONFIG',
  GET_LAYOUT_CONFIG_SUCCESS = '[Layout] GET_LAYOUT_CONFIG_SUCCESS',
  GET_LAYOUT_CONFIG_FAILED = '[Layout] GET_LAYOUT_CONFIG_FAILED',
  CLEAR_LAYOUT_CONFIG = '[Layout] CLEAR_LAYOUT_CONFIG',
}

export const getLayoutConfig = (
  payload?: IHeaderRoutes
): IAction<IHeaderRoutes> => ({
  type: LayoutActionTypes.GET_LAYOUT_CONFIG,
  payload,
});

export const getLayoutConfigSuccess = (
  payload?: IHeaderRoutes
): IAction<IHeaderRoutes> => ({
  type: LayoutActionTypes.GET_LAYOUT_CONFIG_SUCCESS,
  payload,
});

export const getLayoutConfigFailed = (error: string): IAction<any> => ({
  type: LayoutActionTypes.GET_LAYOUT_CONFIG_FAILED,
  error,
});

export const clearLayoutConfig = (): IAction<any> => ({
  type: LayoutActionTypes.CLEAR_LAYOUT_CONFIG,
});
