import { CarSubModelImportAction } from 'presentation/redux/actions/carSubModel';
import * as CONSTANTS from 'shared/constants';
import { IAction } from 'shared/interfaces/common';
import { ILookUpUser } from 'shared/interfaces/common/admin/user';

import {
  customImportedStatus,
  formatImportedHistory,
} from '../../importHistory.helper';
import { initialState, updateTokenList } from '../carSubModelReducer.helper';

export { customImportedStatus };

export const formatCarSubModelImportedHistory = (
  listImportedPackage: any[] = [],
  userList: ILookUpUser[] = []
): any =>
  formatImportedHistory({
    listImportedPackage,
    userList,
    downloadLinkBuilder: (importedPackage) =>
      `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.leadImport.getImportDownloadUrlBase}/${importedPackage.name}:generateDownloadUrl`,
  });

export default function listImportCarSubModelReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT: {
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
    case CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_SUCCESS: {
      const { importList, userList, pageToken } = action.payload;

      const formatList =
        formatCarSubModelImportedHistory(importList, userList) || [];
      const token = pageToken;
      return {
        ...state,
        data: formatList,
        isFetching: false,
        pageToken: token,
      };
    }
    case CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_FAILED: {
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
