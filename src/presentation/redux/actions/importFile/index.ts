import { IAction } from 'shared/interfaces/common';

export enum ImportFileAction {
  IMPORT_CSV = '[ImportFile] IMPORT_CSV',
  IMPORT_CSV_SUCCESS = '[ImportFile] IMPORT_CSV_SUCCESS',
  IMPORT_CSV_FAILED = '[ImportFile] IMPORT_CSV_FAILED',
  SET_FILE = '[ImportFile] SET_FILE',
  SET_FILE_FAIL = '[ImportFile] SET_FILE_FAIL',
  RESET_FILE = '[ImportFile] RESET_FILE',
  CLEAR_IMPORT = '[Import] clear import',
}

export const importCSV = (payload?: any): IAction<any> => ({
  type: ImportFileAction.IMPORT_CSV,
  payload,
});

export const importCSVSuccess = (payload?: any): IAction<any> => ({
  type: ImportFileAction.IMPORT_CSV_SUCCESS,
  payload,
});

export const importCSVFailed = (payload?: any): IAction<any> => ({
  type: ImportFileAction.IMPORT_CSV_FAILED,
  payload,
});

export const setFile = (payload?: any): IAction<any> => ({
  type: ImportFileAction.SET_FILE,
  payload,
});

export const setFileFail = (payload?: any): IAction<any> => ({
  type: ImportFileAction.SET_FILE_FAIL,
  payload,
});

export const resetFile = (): IAction<any> => ({
  type: ImportFileAction.RESET_FILE,
});

export const clearImport = (): IAction<any> => ({
  type: ImportFileAction.CLEAR_IMPORT,
});
