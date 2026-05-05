/* eslint-disable no-param-reassign */
import { ProductTypeFilter } from '../../../../../config/TypeFilter';

import { IState, IAction } from '../../../../../shared/interfaces/common';
import { ITeam } from '../../../../../shared/interfaces/common/admin/team';

interface IPageToken {
  page: number;
  token: string;
}

const capitalFirstLetter = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const formatTeamList = (teamList: ITeam[] = []) =>
  teamList.map((team) => {
    const findProduct = ProductTypeFilter.find(
      (item) => item.value === team.productType
    );

    return {
      ...team,
      createTime: new Date(team.createTime).toLocaleDateString('en-US'),
      updateTime: new Date(team.updateTime).toLocaleDateString('en-US'),
      managerFullName: team.managerFullName,
      supervisorFullName: team.supervisorFullName,
      leadType: capitalFirstLetter(team.leadType),
      productName: findProduct?.title || '',
    };
  });

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

export const updateTeamList = (state: IState<any>, action: IAction<any>) => {
  const leadData = [...state.data];
  const newLeadData = leadData.map((item) => {
    if (item.name === action.payload._data.name) {
      item = action.payload._data;
      return item;
    }
    return item;
  });
  return newLeadData;
};
