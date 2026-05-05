import { CustomerResponse } from 'data/slices/leadSlice/types';
import { ITeam } from 'shared/interfaces/common/admin/team';

interface Config {
  name: string;
  createTime: string | null;
  updateTime: string | null;
  deleteTime: string | null;
  effectiveDate: string;
  agent: string;
  rank: number;
  tier: string;
  conversionRate: string;
  quota: number;
  absent: boolean;
  sundayAgent: boolean;
}
interface AssignmentAttribute {
  assignedLeadCount?: number;
}
export interface AssignLead {
  config: Config;
  user: CustomerResponse;
  team: ITeam | null;
  attributes: AssignmentAttribute | null;
}

export interface AutoAssignLeadResponse {
  assignments: AssignLead[];
  total: number;
}

export interface AutoAssignLeadPayload {
  listPageToken?: any[];
  queryParams?: {
    currentPage?: number;
    filter?: string;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    showDeleted?: boolean;
  };
  tableType?: string;
}
interface LeadResponse {
  id: string | undefined;
  teamId: string | undefined;
  configId: string;
  status: string;
  displayName: string;
  fullName: string;
  email: string;
  tier: string;
  dailyQuota: number;
  assignedLeadCount: string;
  lastImport: string | null;
  effectiveDate: string;
}
export interface CustomAutoLeadResponse {
  imports: LeadResponse[];
}
export interface AutoAssignConfigPayload {
  id: string;
  absent: boolean;
}

export interface UpdateAgentStatusResponse {
  absent: boolean;
  agent: string;
  conversionRate: string;
  createTime: string | null;
  deleteTime: string | null;
  effectiveDate: string;
  name: string;
  quota: number;
  rank: number;
  tier: string;
  updateTime: string | null;
}
export interface AssignmentParams {
  numTopTier: number;
  premiumLeadThreshold: number;
  autoAssignmentEnabled: boolean;
}
export interface AutoAssignSetting {
  name: string;
  product: string;
  createTime: string | null;
  updateTime: string | null;
  deleteTime: string | null;
  motorAssignmentParams: AssignmentParams;
}
export interface GetAutoAssignSettingResponse {
  parameters: AutoAssignSetting[];
}
