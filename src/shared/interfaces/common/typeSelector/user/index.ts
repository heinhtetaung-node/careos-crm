export interface IGetUserList {
  pageSize?: number;
  pageToken?: string;
  showDeleted?: boolean;
  filter?: string;
  orderBy?: string;
}
