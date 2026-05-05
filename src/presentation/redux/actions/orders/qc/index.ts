import { IAction } from 'shared/interfaces/common';

export enum QCModuleActions {
  GET_QC_MODULE = '[Order] GET_QC_MODULE',
  GET_QC_MODULE_SUCCESS = '[Order] GET_QC_MODULE_SUCCESS ',
  GET_QC_MODULE_FAILED = '[Order] GET_QC_MODULE_FAILED',
  UPDATE_ORDER_LIST = '[Order] UPDATE_ORDER_QC_LIST',
  RESET_PAGE_STATE = '[Order] GET_QC_MODULE_RESET_ALL',
}

export const getQCModule = (payload?: any): IAction<any> => ({
  type: QCModuleActions.GET_QC_MODULE,
  payload,
});

export const getQCModuleSuccess = (payload?: any): IAction<any> => ({
  type: QCModuleActions.GET_QC_MODULE_SUCCESS,
  payload,
});

export const getQCModuleFailed = (payload?: any): IAction<any> => ({
  type: QCModuleActions.GET_QC_MODULE_FAILED,
  payload,
});

export const updateAssigneeOrderQCList = (payload?: any): IAction<any> => ({
  type: QCModuleActions.UPDATE_ORDER_LIST,
  payload,
});

export const resetPageStates = (): IAction<any> => ({
  type: QCModuleActions.RESET_PAGE_STATE,
});
