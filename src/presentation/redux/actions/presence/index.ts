import { IAction } from '../../../../shared/interfaces/common';
import { IPresence } from '../../../../shared/interfaces/common/admin/user';

export enum PresenceActionTypes {
  LOGOUT_USER = '[Presence] LOGOUT_USER',
  LOGOUT_USER_SUCCESS = '[Presence] LOGOUT_USER_SUCCESS',
  LOGOUT_USER_FAILED = '[Presence] LOGOUT_USER_FAILED',
  UPDATE_PRESENCE = '[Presence] UPDATE_PRESENCE',
  UPDATE_PRESENCE_SUCCESS = '[Presence] UPDATE_PRESENCE_SUCCESS',
  UPDATE_PRESENCE_FAILED = '[Presence] UPDATE_PRESENCE_FAILED',
  RESET_IS_LOGOUT_SUCCESS = '[Presence] RESET_IS_LOGOUT_SUCCESS',
}

export const logoutUser = (
  payload?: IPresence,
  userName?: string
): IAction<any> => ({
  type: PresenceActionTypes.LOGOUT_USER,
  payload,
  userName,
});

export const logoutUserSuccess = (payload?: IPresence): IAction<any> => ({
  type: PresenceActionTypes.LOGOUT_USER_SUCCESS,
  payload,
});

export const logoutUserFailed = (payload?: string): IAction<any> => ({
  type: PresenceActionTypes.LOGOUT_USER_FAILED,
  payload,
});

export const updatePresence = (
  payload?: IPresence,
  userName?: string
): IAction<any> => ({
  type: PresenceActionTypes.UPDATE_PRESENCE,
  payload,
  userName,
});

export const updatePresenceSuccess = (payload: IPresence): IAction<any> => ({
  type: PresenceActionTypes.UPDATE_PRESENCE_SUCCESS,
  payload,
});

export const updatePresenceFailed = (payload?: string): IAction<any> => ({
  type: PresenceActionTypes.UPDATE_PRESENCE_FAILED,
  payload,
});

export const resetIsLogoutSuccess = (): IAction<any> => ({
  type: PresenceActionTypes.RESET_IS_LOGOUT_SUCCESS,
});
