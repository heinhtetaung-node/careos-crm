import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';

import { Lead } from 'shared/types/lead';

import { QueryProps } from '../helper';

export interface LeadSearchRequest {
  page_size: number;
  page_from?: number;
  filter?: string;
  product: string;
  order_by: string;
  withRejectionComment?: boolean;
  currentUser?: {
    role: string;
  };
}

export interface LeadSearchResponse {
  leads: {
    appointments: any[];
    assigned: any;
    attributes: any;
    car: any;
    customer: any;
    insurance: any;
    insuree: any;
    lead: Lead;
    rejections: any[];
    source: any;
    team: any;
  }[];
  total: string;
}

export type FormattedLeadSearchResponse<T> = {
  total: number;
  leads: T;
};

export const isQuerySuccess = (
  response: any
): response is QueryReturnValue<
  LeadSearchResponse,
  undefined,
  FetchBaseQueryMeta
> => Boolean(response?.data?.leads);

export interface Team {
  name: string;
  leadType: '' | 'new' | 'retainer' | 'renewal';
  productType: 'products/car-insurance' | 'products/health-insurance' | '';
  productName?: string;
  manager: string;
  managerFirstName: string;
  managerLastName: string;
  managerFullName: string;
  supervisor: string;
  supervisorFirstName: string;
  supervisorLastName: string;
  supervisorFullName: string;
  createBy: string;
  createByFirstName: string;
  createByLastName: string;
  createByFullName: string;
  memberCount: number;
  displayName: string;
  createTime: string;
  updateTime: string;
  deleteTime: null | string;
}

export interface TeamsResponse {
  teams: Team[];
  total: string;
}

interface QueryParams extends QueryProps {
  type: string;
}

export type GenericSearchRequest = {
  queryParams: QueryParams;
  tableType?: string;
};

export type GenericSearchResponse = TeamsResponse;
