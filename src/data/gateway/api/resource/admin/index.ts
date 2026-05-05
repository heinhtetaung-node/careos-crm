import * as CONSTANTS from 'shared/constants';

import { IResource } from '../../../../../shared/interfaces/common/resource';
import Type from '../../type';

const CreateUser = (): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.user.create}`,
});

const AddUserToTeam = (team: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/${team}/members`,
});

const CreateTeam = (): IResource => ({
  Type: Type.Public,
  Path: `/api/team/v1alpha1/teams`,
});

const EditUser = (name?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.userEndpoint}/${name}`,
});

const DeleteMembership = (name: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/${name}`,
});

const DeleteUser = (name?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/user/v1alpha1/${name}`,
});

const UnDeleteUser = (name?: string): IResource => ({
  Type: Type.Public,
  Path: `/api/user/v1alpha1/${name}:undelete`,
});

const MoveUserToTeam = (team: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.teamEndpoint}/${team}:move`,
});

const EditTeam = (name: string): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiUrl.team.update}/${name}`,
});

export default {
  CreateUser,
  AddUserToTeam,
  CreateTeam,
  EditUser,
  DeleteMembership,
  EditTeam,
  DeleteUser,
  UnDeleteUser,
  MoveUserToTeam,
};
