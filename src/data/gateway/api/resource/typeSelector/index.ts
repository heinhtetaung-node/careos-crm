import * as CONSTANTS from 'shared/constants';

import { IResource } from '../../../../../shared/interfaces/common/resource';
import Type from '../../type';

const GetRole = (params?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.getRole}?${params}`,
});
const GetTeamRole = (params?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.getTeamRole}?${params}`,
});
const GetTeamDetail = (teamName?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/${teamName}`,
});
const GetAllInsurers = (params?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.getAllInsurers}?${params}`,
});
const GetTeam = (params: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/teams?${params}`,
});
const GetUser = (params: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.getUser}?${params}`,
});

export default {
  GetRole,
  GetTeam,
  GetUser,
  GetTeamRole,
  GetAllInsurers,
  GetTeamDetail,
};
