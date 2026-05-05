export interface ICreateUser {
  id?: number;
  humanId?: string;
  role?: number;
  firstName?: string;
  lastName?: string;
  createBy?: string;
  annotations?: ICreateUserAnotation;
  team?: string;
}

export interface ICreateUserAnotation {
  daily_limit?: string;
  score?: string;
  total_limit?: string;
  lang?: string;
}

export interface IHandleTeamMember {
  user?: string;
  createBy?: string;
  name?: string;
  team: string;
}

export interface IGetTeamByUser {
  members?: IMember[];
  nextPageToken?: string;
}

export interface IMember {
  name: string;
  user: string;
}
export interface IAnnotations {
  dailyLimit: number;
  score: number;
  totalLimit: number;
  licenseNo?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
}

export interface IUser {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  createTime: string;
  updateTime: string;
  deleteTime: string;
  createBy: string;
  annotations?: IAnnotations;
  role?: string;
  fullName: string;
  loginTime: any; // don't know server response when have data,0 `any` for now
  createByFirstName: string;
  createByLastName: string;
  createByFullName: string;
  teamProduct: string;
  teamDisplayName: string;
}

export interface ITeamInfo {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: string;
  createBy: string;
  displayName: string;
  productType: string;
  customerType: string;
  manager: string;
  supervisor: string;
  humanId: string;
  role: string;
  firstName: string;
  lastName: string;
  annotations?: IAnnotations;
  leadType: string;
}

export interface IUserResponse {
  nextPageToken: string;
  users: Array<IUser>;
}

export interface IRole {
  createBy: string;
  createTime: string;
  deleteTime: string;
  displayName: string;
  name: string;
  updateTime: string;
}

export interface IPresence {
  status?: string;
  interactTime?: string | number;
  awayReason?: string;
  updateTime?: string;
}

export interface IImportUserPayload {
  userRole: string;
  firstName: string;
  lastName: string;
  userName: string;
  assignedProduct: string;
  assignedTeam: string;
  dailyLeadLimit: string;
  totalLeadLimit: string;
  agentScore: string;
  userStatus: string;
}

export interface ILookUpUser {
  key: string;
  value: string;
}

export interface ILookUpUserResponse {
  users: Array<ILookUpUser>;
}
