import { defer, EMPTY } from 'rxjs';
import { expand, pluck, reduce } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import getConfig from 'data/setting';
import ResponseModel from 'models/response';
import PresentationUserModel from 'presentation/models/typeSelector/user';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';
import { IGetTeamList } from 'shared/interfaces/common/typeSelector/team';
import { IGetUserList } from 'shared/interfaces/common/typeSelector/user';

const getRoles = (params: IGetRoleSelector) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getRoleResource = RabbitResource.TypeSelector.GetRole(_params);

  return apiGateway.doGetAjaxRequest(getRoleResource).pipe(pluck('data'));
};

const getTeamRoles = (params: IGetRoleSelector) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getTeamRoleResource = RabbitResource.TypeSelector.GetTeamRole(_params);

  return apiGateway.doGetAjaxRequest(getTeamRoleResource).pipe(pluck('data'));
};

const getAllInsurers = (params: any) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getAllInsurersResource =
    RabbitResource.TypeSelector.GetAllInsurers(_params);

  return apiGateway
    .doGetAjaxRequest(getAllInsurersResource)
    .pipe(pluck('data'));
};

const getUsers = (params: IGetUserList) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getUserResource = RabbitResource.TypeSelector.GetUser(_params);

  return apiGateway.doGetAjaxRequest(getUserResource).pipe(pluck('data'));
};

const getManagerUsers = (params: IGetUserList) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getUserResource = RabbitResource.TypeSelector.GetUser(_params);

  return apiGateway
    .doGetRequest(getUserResource)
    .then((response: ResponseModel<PresentationUserModel>) => {
      const { data } = response;
      return data;
    });
};

const getSupervisorUsers = (params: IGetUserList) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getUserResource = RabbitResource.TypeSelector.GetUser(_params);

  return apiGateway
    .doGetRequest(getUserResource)
    .then((response: ResponseModel<PresentationUserModel>) => {
      const { data } = response;
      return data;
    });
};

const getTeams = (params: IGetTeamList) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const _params = apiGateway.getParam(params);

  const getTeamResource = RabbitResource.TypeSelector.GetTeam(_params);

  return apiGateway.doGetAjaxRequest(getTeamResource).pipe(pluck('data'));
};

const getAllTeams = (payload: any) => {
  const payloadClone = {
    ...payload,
    pageSize: payload.pageSize || 100,
  };

  return getTeams(payloadClone).pipe(
    expand((response: any) => {
      return defer(() =>
        response.nextPageToken
          ? getTeams({
              ...payload,
              pageToken: response.nextPageToken,
            })
          : EMPTY
      );
    }),
    pluck('teams'),
    reduce((acc, cur: any) => {
      const data = acc.concat(cur);
      return data;
    }, [])
  );
};

const getTeamDetail = (params: any) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getTeamDetailResource = RabbitResource.TypeSelector.GetTeamDetail(
    params.name
  );
  return apiGateway.doGetAjaxRequest(getTeamDetailResource).pipe(pluck('data'));
};

export default {
  getRoles,
  getUsers,
  getTeams,
  getAllTeams,
  getManagerUsers,
  getSupervisorUsers,
  getTeamRoles,
  getAllInsurers,
  getTeamDetail,
};
