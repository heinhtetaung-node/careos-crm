export interface IInsurer {
  id: number;
  nameEn: string;
  nameTh: string;
  shortNameEn: string;
  shortNameTh: string;
}

export interface ICreateTeam {
  name?: string;
  createBy?: string;
  displayName: string;
  productType?: string;
  leadType?: string;
  manager: string;
  supervisor: string;
  role?: string;
  insurers?: string[];
}
export interface ICreateTeamNew {
  createBy?: string;
  displayName: string;
  productType?: string;
  leadType?: string;
  manager: string;
  supervisor: string;
  role: string;
  insurers?: string[];
}

export interface IUpdateTeam {
  createBy?: string;
  displayName: string;
  productType?: string;
  leadType?: string;
  manager: string;
  supervisor: string;
  insurers?: string[];
}

export interface ITeamResponse {
  nextPageToken: string;
  teams: Array<ITeam>;
}

export interface ITeam {
  createBy: string;
  createTime: string;
  leadType: string;
  deleteTime: any;
  displayName: string;
  manager: string;
  name: string;
  productType: string;
  supervisor: string;
  updateTime: string;
  managerFirstName: string;
  managerFullName: string;
  managerLastName: string;
  supervisorFirstName: string;
  supervisorFullName: string;
  supervisorLastName: string;
  createByFirstName: string;
  createByFullName: string;
  createByLastName: string;
  memberCount: number;
}
