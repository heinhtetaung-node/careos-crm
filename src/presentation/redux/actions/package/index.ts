import { IAction } from 'shared/interfaces/common';

export enum PackageImportAction {
  GET_PACKAGE_IMPORT = '[Package] GET_PACKAGE_IMPORT',
  GET_PACKAGE_IMPORT_SUCCESS = '[Package] GET_PACKAGE_IMPORT_SUCCESS',
  GET_PACKAGE_IMPORT_FAILED = '[Package] GET_PACKAGE_IMPORT_FAILED',
}

export const getPackageImport = (payload?: any): IAction<any> => ({
  type: PackageImportAction.GET_PACKAGE_IMPORT,
  payload,
});

export const getPackageImportSuccess = (payload?: any): IAction<any> => ({
  type: PackageImportAction.GET_PACKAGE_IMPORT_SUCCESS,
  payload,
});

export const getPackageImportFail = (payload?: any): IAction<any> => ({
  type: PackageImportAction.GET_PACKAGE_IMPORT_FAILED,
  payload,
});
