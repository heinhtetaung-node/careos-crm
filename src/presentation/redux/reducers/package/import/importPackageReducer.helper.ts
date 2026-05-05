import { IState } from 'shared/interfaces/common';
import { ITeam } from 'shared/interfaces/common/admin/team';

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

export const initialState: IState<ITeam[]> & IPageState = {
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
export const updateTokenList = (
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
