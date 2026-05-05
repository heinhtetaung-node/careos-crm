import { CommonAPIResponse } from '../types';

export interface User extends CommonAPIResponse {
  name: string;
  humanId: string;
  role: string;
  firstName: string;
  lastName: string;
  annotations: Record<string, any>;
  title: string;
  loginTime: string;
}

export interface LeadSearchPayload {
  payload: {
    filter?: string;
  };
}

export interface UsersResponse {
  users: User[];
  nextPageToken: string;
}

export interface AssignedUsersResponse {
  assignedUsers: User[];
  nextPageToken: string;
}
export interface UsersSearchResponse {
  users: UserLeadSearchResponse[];
  total: string;
}

export interface UserLeadSearchResponse extends User {
  fullName?: string;
  createByFirstName?: string;
  createByLastName?: string;
  createByFullName?: string;
  teamProduct?: string;
  teamDisplayName?: string;
}

export interface QueryProps {
  pageSize: number;
  filter?: string | null;
  orderBy?: string | null;
  currentPage?: number;
}

export interface Roles extends CommonAPIResponse {
  name: string;
  displayName: string;
}

export interface RolesResponse {
  roles: Roles[];
  nextPageToken: string;
}

interface AnnotationsProps {
  daily_limit?: string;
  lang: string;
  score?: string;
  total_limit?: string;
  license_no?: string;
  license_issue_date?: string;
  license_expiry_date?: string;
}

export interface CreateUserRequest {
  role: string;
  firstName: string;
  lastName: string;
  humanId: string;
  product?: string;
  annotations: AnnotationsProps;
}

export interface UpdateUserRequest {
  userId: string;
  userData: CreateUserRequest;
}
