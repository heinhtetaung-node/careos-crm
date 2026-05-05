import { getFormattedOrderBy } from 'data/slices/orderSlice/helper';
import { IPageState } from 'shared/interfaces/common/table';

interface IToken {
  page: number;
  token: string;
}

export enum SORT_TABLE_TYPE {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

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

export const prevPageHandle = (listToken: IToken[], page: number) =>
  listToken.find((item: { page: number; token: string }) => item.page === page);

export const getOrderByField = (field: string, status?: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE) return '';
  if (status === SORT_TABLE_TYPE.ASC) return `${field}`;
  return `${field} desc`;
};

export const getOrderConfigsOrderBy = (
  field: string,
  status?: SORT_TABLE_TYPE
) => {
  if (status === SORT_TABLE_TYPE.NONE) return '';
  if (status === SORT_TABLE_TYPE.ASC) return getFormattedOrderBy[field];
  return `${getFormattedOrderBy[field]} desc`;
};

export const changeSortStatus = (status: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE || status === undefined)
    return SORT_TABLE_TYPE.ASC;
  if (status === SORT_TABLE_TYPE.ASC) return SORT_TABLE_TYPE.DESC;
  return SORT_TABLE_TYPE.NONE;
};

export const getCustomAction = (linkName: string, tableName: string) => {
  if (
    ![
      'package',
      'leads',
      'carSubModel',
      'carModel',
      'carBrand',
      'redbook',
      'customerProfile',
      'curatedCar',
      'autoAssignImport',
      'massLeadImport',
      'discountsImport',
      'massStatusChange',
      'customersMerge',
      'healthLeadImport',
    ].includes(tableName)
  ) {
    return;
  }
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', linkName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
