import * as CONSTANTS from 'shared/constants';
import { formatDDMMYYYYHHMMSS } from 'shared/helper/utilities';
import { IAction } from 'shared/interfaces/common';
import { ILookUpUser } from 'shared/interfaces/common/admin/user';

import { CustomerProfileImportAction } from '../../../actions/customerProfile';
import {
  customImportedStatus,
  formatImportedHistory,
} from '../../importHistory.helper';
import {
  initialState,
  updateTokenList,
} from '../customerProfileReducer.helper';

export { customImportedStatus };

export const formatCustomerProfileImportedHistory = (
  listImportedPackage: any[] = [],
  userList: ILookUpUser[] = []
): any =>
  formatImportedHistory({
    listImportedPackage,
    userList,
    downloadLinkBuilder: (importedPackage) =>
      `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.leadImport.getImportDownloadUrlBase}/${importedPackage.name}:generateDownloadUrl`,
    itemMapper: (importedPackage) => ({
      lastDate: formatDDMMYYYYHHMMSS(importedPackage?.updateTime),
      importedRows: importedPackage.imported || 0,
    }),
  });

export default function listImportCustomerProfileReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT: {
      const { currentPage, pageToken, pageSize, orderBy, showDeleted, filter } =
        action.payload;
      return {
        ...state,
        isFetching: true,
        listPageToken: updateTokenList(
          state.listPageToken,
          currentPage,
          pageToken
        ),
        pageIndex: currentPage,
        pageSize,
        orderBy,
        showDeleted,
        filter,
      };
    }
    case CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_SUCCESS: {
      const { importList, userList, pageToken } = action.payload;

      const formatList =
        formatCustomerProfileImportedHistory(importList, userList) || [];
      const token = pageToken;
      return {
        ...state,
        data: formatList,
        isFetching: false,
        pageToken: token,
      };
    }
    case CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        pageToken: '',
        success: false,
      };
    }
    default:
      return state;
  }
}
