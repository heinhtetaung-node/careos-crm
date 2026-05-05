export interface IGetTeamList {
  pageSize?: number;
  pageToken?: string;
  showDeleted?: boolean;
  filter?: string;
  orderBy?: string;
}
