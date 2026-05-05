import { IAction } from 'shared/interfaces/common';

export enum CarSubModelImportAction {
  GET_CAR_SUB_MODEL_IMPORT = '[CarSubModel] GET_CAR_SUB_MODEL_IMPORT',
  GET_CAR_SUB_MODEL_IMPORT_SUCCESS = '[CarSubModel] GET_CAR_SUB_MODEL_IMPORT_SUCCESS',
  GET_CAR_SUB_MODEL_IMPORT_FAILED = '[CarSubModel] GET_CAR_SUB_MODEL_IMPORT_FAILED',
}

export const getCarSubModelImport = (payload?: any): IAction<any> => ({
  type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT,
  payload,
});

export const getCarSubModelImportSuccess = (payload?: any): IAction<any> => ({
  type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_SUCCESS,
  payload,
});

export const getCarSubModelImportFail = (payload?: any): IAction<any> => ({
  type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_FAILED,
  payload,
});
