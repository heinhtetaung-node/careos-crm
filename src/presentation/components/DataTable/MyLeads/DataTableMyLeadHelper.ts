export const DEFAULT_PER_PAGE_TABLE = 10;

export const ITEM_PER_PAGE_LIST = [5, 10, 25];

export const getShimmerArray = (pageLength: number) =>
  Array(pageLength).fill({});
export interface IData {
  [key: string]: string | number | boolean;
}
