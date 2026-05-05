import * as uuid from 'uuid';

import { StatusImportedPackage } from 'presentation/pages/car-insurance/package/ImportPackagePage/importPackagePageHelper';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { formatDDMMYYYYHHMMSS } from 'shared/helper/utilities';
import { IAction, IState } from 'shared/interfaces/common';
import { ILookUpUser } from 'shared/interfaces/common/admin/user';

import { PackageImportAction } from '../../../../actions/package';
import { updateTokenList } from '../importPackageReducer.helper';

interface IPageToken {
  page: number;
  token: string;
}

interface IPageState {
  pageIndex?: number;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string[];
  showDeleted?: boolean;
  listPageToken?: IPageToken[];
  filter?: string | null;
}

const initialState: IState<any> & IPageState = {
  data: [],
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
  pageToken: '',
  listPageToken: [],
  pageIndex: 0,
  pageSize: 0,
  orderBy: [],
  showDeleted: false,
  filter: '',
};

const customImportedStatus = (status: string) => {
  const findImportedStatus = StatusImportedPackage.find(
    (item) => item.value === status
  );
  return getString(findImportedStatus?.title || '') || '';
};

const formatImportedPackageHistory = (
  listImportedPackage: any[],
  userList: ILookUpUser[] = []
) => {
  const data = listImportedPackage.map((importedPackage) => {
    const createByUser = userList.find(
      (item: ILookUpUser) => item?.key === importedPackage.createBy
    );
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.package.getPackageImportDownloadUrl}/${importedPackage.name}:generateDownloadUrl`;

    return {
      importStatus: customImportedStatus(importedPackage?.status),
      importDate: formatDDMMYYYYHHMMSS(importedPackage?.createTime),
      importFileName: importedPackage?.filename || '',
      importedBy: createByUser?.value || '-',
      errors: importedPackage.errors || [],
      packageType: importedPackage?.packageDetails?.packageType,
      numberOfPackages: importedPackage?.imported,
      name: importedPackage.name,
      downloadLink,
    };
  });
  // INFO: Auto add fake id
  return data.map((item) => ({
    ...item,
    id: uuid.v4(),
  }));
};

export default function listReducer(
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case PackageImportAction.GET_PACKAGE_IMPORT: {
      const { currentPage, pageToken, pageSize, orderBy, showDeleted } =
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
      };
    }
    case PackageImportAction.GET_PACKAGE_IMPORT_SUCCESS: {
      const formatList =
        formatImportedPackageHistory(
          action.payload?.importList || [],
          action.payload?.userList || []
        ) || [];
      const token = action.payload?.pageToken;
      return {
        ...state,
        data: formatList,
        isFetching: false,
        pageToken: token,
      };
    }
    case PackageImportAction.GET_PACKAGE_IMPORT_FAILED: {
      return {
        ...state,
        success: false,
        data: [],
        isFetching: false,
        token: '',
      };
    }

    default:
      return state;
  }
}
