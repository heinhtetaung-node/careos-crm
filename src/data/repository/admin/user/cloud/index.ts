import { defer, EMPTY, Observable } from 'rxjs';
import { expand, map, pluck, reduce } from 'rxjs/operators';

import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import {
  IGetTeamByUser,
  ITeamInfo,
  IUserResponse,
  ILookUpUserResponse,
  ILookUpUser,
} from 'shared/interfaces/common/admin/user';

import { recursiveApi } from '../../../../../shared/helper/operator';
import ApiGateway from '../../../../gateway/api';
import { RabbitResource } from '../../../../gateway/api/resource';
import ResponseModel from '../../../../models/response';
import getConfig from '../../../../setting';

const GET_SUPERVISOR_QUERY = 'role="roles/supervisor"';
const GET_MANAGER_QUERY = 'role="roles/manager"';
const GET_ADMIN_QUERY = 'role="roles/admin"';

const getUsers = (payload: {
  [key: string]: number | string | boolean;
}): Observable<ResponseModel<IUserResponse>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getUsersResource = RabbitResource.User.getUsers(payload);
  return apiGateway.doGetAjaxRequest(getUsersResource).pipe(pluck('data'));
};

const getUsersWithTeams = (payload: {
  [key: string]: number | string | boolean;
}): Observable<any> => {
  const pageStage = {
    ...payload,
    currentPage: 1,
    pageToken: '',
  };
  return getUsers(pageStage).pipe(
    expand((response: any) =>
      defer(() =>
        response.nextPageToken
          ? getUsers({
              ...payload,
              pageToken: response.nextPageToken,
            })
          : EMPTY
      )
    ),
    pluck('usersWithTeam'),
    reduce((acc, cur: any) => acc.concat(cur), [])
  );
};

const getUsersWithTeamsAscending = (): Observable<
  ResponseModel<IUserResponse>
> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getUsersResource = RabbitResource.User.getUsersAscending();
  return apiGateway
    .doGetAjaxRequest(getUsersResource)
    .pipe(pluck('data', 'usersWithTeam'));
};

const getUserByType = (
  pageState: any,
  pageSize: string | number | boolean,
  filter: string,
  orderBy: string
) =>
  getUsers(pageState).pipe(
    expand((response: any) =>
      defer(() =>
        response.nextPageToken
          ? getUsers({
              pageSize,
              pageToken: response.nextPageToken,
              filter,
              orderBy,
            })
          : EMPTY
      )
    ),
    pluck('usersWithTeam'),
    reduce((acc, cur: any) => acc.concat(cur), [])
  );

const getSupervisors = (
  payload: {
    [key: string]: number | string | boolean;
  } & { orderBy?: string[] }
): Observable<any> => {
  const filter = `${payload.filter} ${GET_SUPERVISOR_QUERY}`;
  const orderBy = `${payload.orderBy}`;
  const { pageSize } = payload;
  const pageStage = {
    currentPage: 1,
    pageSize,
    pageToken: '',
    filter,
    orderBy,
  };
  return getUserByType(pageStage, pageSize, filter, orderBy);
};

const getManagers = (payload: {
  [key: string]: number | string | boolean;
}): Observable<any> => {
  const filter = `${payload.filter} ${GET_MANAGER_QUERY}`;
  const orderBy = `${payload.orderBy}`;
  const { pageSize } = payload;
  const pageStage = {
    currentPage: 1,
    pageSize,
    pageToken: '',
    filter,
    orderBy,
  };
  return getUserByType(pageStage, pageSize, filter, orderBy);
};

const getAdmins = (payload: {
  [key: string]: number | string | boolean;
}): Observable<any> => {
  const filter = `${payload.filter} ${GET_ADMIN_QUERY}`;
  const orderBy = `${payload.orderBy}`;
  const { pageSize } = payload;
  const pageStage = {
    currentPage: 1,
    pageSize,
    pageToken: '',
    filter,
    orderBy,
  };
  return getUserByType(pageStage, pageSize, filter, orderBy);
};

const getUser = (id: string): Observable<ResponseModel<IUserResponse>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getUsersResource = RabbitResource.User.getUser(id);
  return apiGateway.doGetAjaxRequest(getUsersResource).pipe(pluck('data'));
};

const getTeamByUser = (
  payload: string
): Observable<ResponseModel<IGetTeamByUser>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getTeamByUserResource = RabbitResource.User.getTeamByUser(payload);
  return apiGateway.doGetAjaxRequest(getTeamByUserResource).pipe(pluck('data'));
};

const getTeamInfo = (payload: string): Observable<ResponseModel<ITeamInfo>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getTeamResource = RabbitResource.User.getTeamInfo(payload);
  return apiGateway.doGetAjaxRequest(getTeamResource).pipe(pluck('data'));
};

const importUser = (users: any) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const importUserResource = RabbitResource.User.importUser('');
  return apiGateway
    .doPostAjaxRequest(importUserResource, users)
    .pipe(pluck('data'));
};

const lookUpUser = (): Observable<ResponseModel<ILookUpUserResponse>> => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const lookUpUserResource = RabbitResource.User.lookUpUser('');
  return apiGateway.doGetAjaxRequest(lookUpUserResource).pipe(pluck('data'));
};

const lookUpUserByRole = (payload: string) => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const lookUpUserByRoleResource =
    RabbitResource.User.lookupUserByRole(payload);
  return apiGateway
    .doGetAjaxRequest(lookUpUserByRoleResource)
    .pipe(pluck('data'));
};

const getAdminsLookup = () => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const adminResource = RabbitResource.User.lookupUserByRole(UserRoleID.Admin);
  return apiGateway.doGetAjaxRequest(adminResource).pipe(pluck('data'));
};

const getElasticsearchUser = () => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const elasticsearchUser = RabbitResource.User.getElasticsearchUser();
  return apiGateway.doGetAjaxRequest(elasticsearchUser).pipe(pluck('data'));
};
const getAssignToUser = () => {
  const apiGateway = ApiGateway.createAPIConnection(getConfig());
  const getAssign = RabbitResource.User.getAssignToUser();
  const data = apiGateway.doGetAjaxRequest(getAssign).pipe(
    pluck('data', 'selectData'),
    map((res: ILookUpUser[] = []) =>
      res.map((item: ILookUpUser) => ({
        fullName: item.value,
        name: item.key,
      }))
    )
  );
  return data;
};

const getAllUsers = (payload: Record<string, string | number | boolean>) => {
  const request = getUsers;
  const newPayload = {
    ...payload,
    showDeleted: payload.showDeleted ?? true,
  };
  return recursiveApi<any, ResponseModel<IUserResponse>>(
    request,
    newPayload,
    ['usersWithTeam'],
    'nextPageToken'
  );
};

export default {
  getUsers,
  getTeamByUser,
  getTeamInfo,
  getUser,
  getUsersWithTeams,
  getSupervisors,
  getManagers,
  importUser,
  getUsersWithTeamsAscending,
  lookUpUser,
  lookUpUserByRole,
  getAdmins,
  getAdminsLookup,
  getElasticsearchUser,
  getAssignToUser,
  getAllUsers,
};
