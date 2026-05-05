import { IAction, IState } from 'shared/interfaces/common';
import { IUser } from 'shared/interfaces/common/admin/user';

import { UserActionTypes } from '../../../../actions/admin/user';

interface IPageToken {
  page: number;
  token: string;
}
const formatUserList = (userList: IUser[] = []) =>
  userList.map((user) => ({
    ...user,
    score: user.annotations?.score || '_',
    createOn: new Date(user.createTime).toLocaleDateString(),
    lastLoginOn: new Date(user.updateTime).toLocaleDateString(),
    fullName: `${user.firstName} ${user.lastName}`,
  }));

const updateTokenList = (
  tokenList: IPageToken[] = [],
  page: number,
  token: string
) => {
  let newTokenList = [...tokenList];
  const pageItem = newTokenList.find((item) => item.page === page);
  if (pageItem) {
    newTokenList = newTokenList.map((item) => {
      const tokenItem = item.token;
      return {
        ...item,
        token: item.page === page ? token : tokenItem,
      };
    });
  } else {
    newTokenList.push({ page, token });
  }
  return newTokenList;
};

interface IPageState {
  pageIndex?: number;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string[];
  showDeleted?: boolean;
  listPageToken?: IPageToken[];
  filter?: string | null;
}

const initialState: IState<IUser[]> & IPageState = {
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

export default function listCreatedByReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case UserActionTypes.GET_LIST_CREATED_BY: {
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
    case UserActionTypes.GET_LIST_CREATED_BY_SUCCESS: {
      const userList = action.payload.users;
      const token = action.payload.pageToken;
      return {
        ...state,
        data: formatUserList(userList),
        isFetching: false,
        pageToken: token,
      };
    }
    case UserActionTypes.GET_LIST_CREATED_BY_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        token: '',
      };
    }
    default:
      return state;
  }
}
