export interface IPageState {
  currentPage?: number;
  perPage?: number;
  pageSize?: number;
  pageIndex?: number;
  pageToken?: string;
  pageFrom?: number;
  showDeleted?: boolean;
  orderBy?: string[] | string;
  filter?: string;
  orderId?: string;
  page_from?: number;
}
