import { IAction, ISnackBarConfig } from 'shared/interfaces/common';

// Set UI File Information
export enum UIActionTypes {
  SHOW_SNACKBAR = '[UI] SHOW_SNACKBAR',
  HIDE_SNACKBAR = '[UI] HIDE_SNACKBAR',

  SHOW_MODAL = '[UI] SHOW_MODAL',
  HIDE_MODAL = '[UI] HIDE_MODAL',

  IS_EDIT_TRUE = '[UI] IS_EDIT_TRUE',
  IS_EDIT_FALSE = '[UI] IS_EDIT_FALSE',

  SET_COLLAPSE_STATUS = '[UI] SET_COLLAPSE_STATUS',
  SHOW_ADDRESS_MODAL = '[UI] SHOW_ADDRESS_MODAL',
}

export const showSnackBar = (payload?: ISnackBarConfig): IAction<any> => ({
  type: UIActionTypes.SHOW_SNACKBAR,
  payload,
});

export const hideSnackBar = (): IAction<any> => ({
  type: UIActionTypes.HIDE_SNACKBAR,
});

export const isEditTrue = (): IAction<any> => ({
  type: UIActionTypes.IS_EDIT_TRUE,
});

export const isEditFalse = (): IAction<any> => ({
  type: UIActionTypes.IS_EDIT_FALSE,
});

export const showModal = (payload?: any): IAction<any> => ({
  type: UIActionTypes.SHOW_MODAL,
  payload,
});

export const hideModal = (payload?: any): IAction<any> => ({
  type: UIActionTypes.HIDE_MODAL,
  payload,
});

export const setCollapseStatus = (status: boolean): IAction<any> => ({
  type: UIActionTypes.SET_COLLAPSE_STATUS,
  status,
});

export const showAddressModal = (payload?: any): IAction<any> => ({
  type: UIActionTypes.SHOW_ADDRESS_MODAL,
  payload,
});
