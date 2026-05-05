import { PRODUCT_TYPE } from 'config/TypeFilter';
import { updateTokenList } from 'data/gateway/api/helper/queryString.helper';
import { LeadActionTypes } from 'presentation/redux/actions/leads/import';
import * as CONSTANTS from 'shared/constants';
import { IAction } from 'shared/interfaces/common';
import { ILookUpUser } from 'shared/interfaces/common/admin/user/index';
import { ILeadImportsReponse } from 'shared/interfaces/common/lead/import';

interface LeadImportListReducer {
  data: ILeadImportsReponse[];
  isFetching: boolean;
  success: boolean;
  status: string;
  actionType: string;
  pageToken: string;
  listPageToken: any;
  pageIndex: number;
  pageSize: number;
  orderBy: any;
  showDeleted: boolean;
  filter: string | null;
}

const initialState: LeadImportListReducer = {
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

const formatImportList = (
  importList: ILeadImportsReponse[] = [],
  userList: ILookUpUser[] = []
) =>
  importList.map((importLead) => {
    const displayProduct: string = PRODUCT_TYPE[importLead.product] || '';
    const downloadLink = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.lead.getDownloadLink}/${importLead.name}:generateDownloadUrl`;
    const createByUser = userList.find(
      (item: ILookUpUser) => item?.key === importLead.createBy
    );
    return {
      ...importLead,
      createTime: new Date(importLead.createTime).toLocaleDateString(),
      updateTime: new Date(importLead.updateTime).toLocaleDateString(),
      leadRecord: importLead.imported,
      createBy: createByUser?.value || '-',
      downloadLink,
      displayProduct,
    };
  });

export default function listReducer(
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: IAction<any>
): LeadImportListReducer {
  switch (action.type) {
    case LeadActionTypes.GET_IMPORT_LEADS: {
      const { currentPage, pageToken, pageSize, orderBy, showDeleted, filter } =
        action.payload;

      return {
        ...state,
        isFetching: true,
        listPageToken: updateTokenList(
          currentPage,
          pageToken,
          state.listPageToken
        ),
        pageIndex: currentPage,
        pageSize,
        orderBy,
        showDeleted,
        filter,
      };
    }
    case LeadActionTypes.GET_IMPORT_LEADS_SUCCESS: {
      const token = action.payload.pageToken;
      return {
        ...state,
        data: formatImportList(
          action.payload.importList,
          action.payload.userList
        ),
        isFetching: false,
        pageToken: token,
      };
    }
    case LeadActionTypes.GET_IMPORT_LEADS_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        pageToken: '',
      };
    }
    default:
      return state;
  }
}
