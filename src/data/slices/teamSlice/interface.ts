import { CommonAPIResponse } from '../types';

export interface Team extends CommonAPIResponse {
  name: string;
  displayName: string;
  productType: string;
  leadType: string;
  manager: string;
  supervisor: string;
  insurers: string[];
  role: string;
}

export interface TeamMembers extends CommonAPIResponse {
  name: string;
  user: string;
}

export type ArgsProps = {
  pageSize?: number;
  filter?: string;
} | void;

export interface CreateTeamRequest {
  displayName: string;
  productType?: string;
  leadType?: string;
  manager: string;
  supervisor: string;
  role: string;
  insurers?: any[];
}

export interface UpdateTeamRequest {
  teamData: Omit<CreateTeamRequest, 'role'>;
  teamId: string;
}

export interface Roles extends CommonAPIResponse {
  name: string;
  displayName: string;
}

export interface RolesResponse {
  roles: Roles[];
  nextPageToken: string;
}

export interface QueryProps {
  pageSize: number;
  filter?: string | null;
  orderBy?: string | null;
  currentPage?: number;
}
export interface PayloadProps {
  queryParams?: QueryProps;
}

export interface AddMemberToTeamRequest {
  teamId: string;
  userData: {
    user?: string;
  };
}

export interface DeleteMemberFromTeamRequest {
  fullMemberResource: string;
}

export interface MoveMemberToTeamRequest {
  fullMemberResource: string;
  moveData: {
    parent: string;
  };
}
