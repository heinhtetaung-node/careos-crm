import * as CONSTANTS from 'shared/constants';

import { IResource } from '../../../../../shared/interfaces/common/resource';
import { IPayLoad, queryString } from '../../helper/queryString.helper';
import Type from '../../type';

const getUsers = (payload: IPayLoad): IResource => {
  return {
    Type: Type.Public,
    Path: `/api/${CONSTANTS.apiUrl.user.list}?${queryString(payload)}${
      payload.orderBy || ''
    }`,
  };
};

const getUsersAscending = (): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.user.list}?orderBy=fullName`,
});

const getUser = (id: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.user.get}/${id}`,
});

const getTeamByUser = (filter: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.user.getTeamByUser}?${filter}`,
});

const getTeamInfo = (filter: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/${filter}`,
});

const importUser = (payload: string): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.user.importUser}`,
  };
};

const lookUpUser = (payload: string): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.user.lookUpUser}`,
  };
};

const lookupUserByRole = (payload: string): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiUrl.user.lookUpUser}?role=${payload}`,
  };
};

const getElasticsearchUser = (): IResource => {
  return {
    Type: 'nest',
    Path: `/${CONSTANTS.apiEndpoint.createByUser}`,
  };
};

const getAssignToUser = (): IResource => {
  return {
    Type: Type.Nest,
    Path: `/${CONSTANTS.apiEndpoint.getAssignToUser}`,
  };
};

export default {
  getUsers,
  getTeamByUser,
  getTeamInfo,
  getUser,
  importUser,
  getUsersAscending,
  lookUpUser,
  lookupUserByRole,
  getElasticsearchUser,
  getAssignToUser,
};
