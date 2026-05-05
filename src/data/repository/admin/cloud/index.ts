import { Observable } from 'rxjs';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import ResponseModel from 'models/response';
import { ITeam, ICreateTeam } from 'shared/interfaces/common/admin/team';
import {
  IHandleTeamMember,
  ICreateUser,
} from 'shared/interfaces/common/admin/user';

import getConfig from '../../../setting';

const createUser = (body: ICreateUser) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const createUserResource = RabbitResource.Admin.CreateUser();

  return apiGateway.doPostAjaxRequest(createUserResource, body);
};

const addUserToTeam = (payload: IHandleTeamMember) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const addUserToTeamResource = RabbitResource.Admin.AddUserToTeam(
    payload.team
  );
  const body = {
    user: payload.user,
  };

  return apiGateway.doPostAjaxRequest(addUserToTeamResource, body);
};

const createAdminTeam = (body: ITeam): Observable<ResponseModel<string>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const createAdminResource = RabbitResource.Admin.CreateTeam();
  return apiGateway.doPostAjaxRequest(createAdminResource, body);
};

const editUser = (body: ICreateUser, name: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const editUserResource = RabbitResource.Admin.EditUser(name);

  return apiGateway.doPatchAjaxRequest(editUserResource, body);
};

const editTeam = (body: ICreateTeam, name: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const editTeamResource = RabbitResource.Admin.EditTeam(name);

  return apiGateway.doPatchAjaxRequest(editTeamResource, body);
};

const deleteMembership = (payload: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const deleteMembershipResource =
    RabbitResource.Admin.DeleteMembership(payload);

  return apiGateway.doDeleteAjaxRequest(deleteMembershipResource);
};

const deleteUser = (payload: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const deleteUserResource = RabbitResource.Admin.DeleteUser(payload);

  return apiGateway.doDeleteAjaxRequest(deleteUserResource, payload);
};

const unDeleteUser = (payload: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const unDeleteUserResource = RabbitResource.Admin.UnDeleteUser(payload);

  return apiGateway.doPostAjaxRequest(unDeleteUserResource, payload);
};

const moveUserToTeam = (payload: IHandleTeamMember) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const moveUserToTeamResource = RabbitResource.Admin.MoveUserToTeam(
    payload.team
  );
  const body = {
    parent: payload.name,
  };
  return apiGateway.doPostAjaxRequest(moveUserToTeamResource, body);
};

export default {
  createUser,
  addUserToTeam,
  createAdminTeam,
  editUser,
  deleteMembership,
  editTeam,
  deleteUser,
  unDeleteUser,
  moveUserToTeam,
};
