import { IPageState } from 'shared/interfaces/common/table';

interface IToken {
  page: number;
  token: string;
}

export const DELAY_SCROLL_BOTTOM = 200;
export const ITEM_PER_PAGE_LIST = [15, 25, 50, 75, 100];
export const INITIAL_ITEM_PER_PAGE = 15;
export const initialPageState: IPageState = {
  currentPage: 1,
  pageSize: 15,
  pageToken: '',
  showDeleted: true,
  orderBy: '',
  filter: '',
};

export const defineState = (tableType: string) => `${tableType}Reducer`;

export const prevPageHandle = (listToken: IToken[], page: number) => {
  const findToken = listToken.find(
    (item: { page: number; token: string }) => item.page === page
  );
  return findToken;
};

export enum SORT_TABLE_TYPE {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

export const getOrderByField = (field: string, status?: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE) return '';
  if (status === SORT_TABLE_TYPE.ASC) return `&orderBy=${field}`;
  return `&orderBy=${field} desc`;
};

export const getCustomAction = (linkName: string, tableName: string) => {
  if (
    ['package', 'leads', 'customerProfile', 'carSubModel'].includes(tableName)
  ) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', linkName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
