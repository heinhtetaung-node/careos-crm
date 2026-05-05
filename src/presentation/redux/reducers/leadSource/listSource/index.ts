import { PRODUCT_TYPE } from 'config/TypeFilter';
import { updateTokenList } from 'data/gateway/api/helper/queryString.helper';
import { LeadSourcesActionTypes } from 'presentation/redux/actions/leads/sources';
import { IAction } from 'shared/interfaces/common';
import { ILeadSourcesReponse } from 'shared/interfaces/common/lead/sources';

interface LeadSourcesReducer {
  data: ILeadSourcesReponse[];
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

const initialState: LeadSourcesReducer = {
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

const formatSourceList = (sourceList: ILeadSourcesReponse[] = []) =>
  sourceList.map((source) => {
    const displayProduct: string = PRODUCT_TYPE[source.product] || '';
    return {
      ...source,
      createTime: new Date(source.createTime).toLocaleDateString(),
      updateTime: new Date(source.updateTime).toLocaleDateString(),
      type: `${source.online ? 'Online' : 'Offline'}`,
      hide: `${source.hidden ? 'Yes' : 'No'}`,
      displayProduct,
    };
  });

export default function listReducer(
  state = initialState,
  action: IAction<any>
): LeadSourcesReducer {
  switch (action.type) {
    case LeadSourcesActionTypes.GET_LEAD_SOURCES: {
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
    case LeadSourcesActionTypes.GET_LEAD_SOURCES_SUCCESS: {
      return {
        ...state,
        data: formatSourceList(action.payload.sourcesWithScore),
        isFetching: false,
        pageToken: action.payload.nextPageToken,
      };
    }
    case LeadSourcesActionTypes.GET_LEAD_SOURCES_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        pageToken: '',
      };
    }
    case LeadSourcesActionTypes.FILTER_SOURCE: {
      return {
        ...state,
        filter: action.payload,
      };
    }
    default:
      return state;
  }
}
