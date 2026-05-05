import * as CONSTANTS from 'shared/constants';

import { IResource } from '../../../../../shared/interfaces/common/resource';
import { IPayLoad, queryString } from '../../helper/queryString.helper';
import Type from '../../type';

const getTeams = (payload: IPayLoad & { orderBy?: string[] }): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/teams?${queryString(
    payload
  )}${payload.orderBy || ''}`,
});

const getTeamsOrder = ({
  product,
  role,
  pageSize = 100,
}: IPayLoad & { orderBy?: string[] }): IResource => {
  return {
    Type: Type.Public,
    Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/teams?filter=${product ? `productType="${product}" ` : ''}${
      role
        ? `role="${encodeURIComponent(
            role
          )}"&pageSize=${pageSize}&orderBy=displayName`
        : ''
    }`,
  };
};

const lookupTeam = (): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.team.lookupTeam}`,
  };
};

const lookupTeamSupervisors = (): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.team.lookupTeamSupervisors}`,
  };
};

const lookupTeamManagers = (): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.team.lookupTeamManagers}`,
  };
};

const lookupTeamByProduct = (payload: string): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.user.lookUpUser}?product=${payload}`,
  };
};

const getElasticsearchTeam = (): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiEndpoint.createByTeam}`,
  };
};

export default {
  getTeams,
  getTeamsOrder,
  lookupTeam,
  lookupTeamByProduct,
  getElasticsearchTeam,
  lookupTeamSupervisors,
  lookupTeamManagers,
};
