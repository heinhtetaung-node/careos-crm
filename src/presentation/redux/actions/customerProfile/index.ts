import { IAction } from 'shared/interfaces/common';

export enum CustomerProfileImportAction {
  GET_CUSTOMER_PROFILE_IMPORT = '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT',
  GET_CUSTOMER_PROFILE_IMPORT_SUCCESS = '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_SUCCESS',
  GET_CUSTOMER_PROFILE_IMPORT_FAILED = '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_FAILED',
}

export const getCustomerProfileImport = (payload?: any): IAction<any> => ({
  type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT,
  payload,
});

export const getCustomerProfileImportSuccess = (
  payload?: any
): IAction<any> => ({
  type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_SUCCESS,
  payload,
});

export const getCustomerProfileImportFail = (payload?: any): IAction<any> => ({
  type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_FAILED,
  payload,
});
