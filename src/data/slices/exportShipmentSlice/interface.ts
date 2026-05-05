import { CommonAPIResponse } from '../types';

export interface ExportShipmentListResponse {
  exports: ({ name: string; status: unknown } & CommonAPIResponse)[];
  nextPageToken: string;
}

export interface ExportShipmentListRequest {
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
}
