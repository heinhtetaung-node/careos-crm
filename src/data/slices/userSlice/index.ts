/* eslint-disable no-param-reassign */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  AssignedUsersResponse,
  LeadSearchPayload,
  QueryProps,
  RolesResponse,
  User,
  UsersResponse,
  UsersSearchResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from './interface';

const modifiedUsers = (users: User[]) => {
  if (!users || (users && users.length <= 0)) return [];
  return users.map((user: User) => ({
    ...user,
    title: `${user.firstName} ${user.lastName}`,
    key: user.name,
    id: user.name,
    value: user.name,
  }));
};

const userSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersResponse, string>({
      async queryFn(arg, _, __, fetchWithBQ) {
        const url = `${basePaths.user}/users?${arg}`;
        let users!: User[];
        let nextPageToken!: string;
        try {
          const { data } = (await fetchWithBQ(url)) as QueryReturnValue<
            UsersResponse,
            FetchBaseQueryError
          >;
          if (data) {
            ({ users, nextPageToken } = data);
          }
        } catch (err) {
          return { error: err as FetchBaseQueryError };
        }
        do {
          if (nextPageToken !== '') {
            const response = (await fetchWithBQ(
              `${url}&pageToken=${nextPageToken}`
            )) as any;
            if (response.data) {
              users = users.concat(response.data.users);
              nextPageToken = response.data.nextPageToken;
            }
          }
        } while (nextPageToken);

        const updatedUsers = modifiedUsers(users);
        return {
          data: { users: updatedUsers, nextPageToken },
        } as any;
      },
    }),
    getAllUsersByStreaming: build.query<UsersResponse, string>({
      query: (params) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/users?${params}`,
        }),
        method: 'GET',
      }),
      transformResponse: (response: UsersResponse) => {
        response.users = modifiedUsers(response?.users);
        return response;
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, getCacheEntry }
      ) {
        await cacheDataLoaded;
        let { data: { nextPageToken } = {} } = getCacheEntry();
        let data: UsersResponse = {} as UsersResponse;
        do {
          if (nextPageToken !== '') {
            const response = await fetch(
              `${baseUrls.salesFlow}/${basePaths.user}/users?${arg}&pageToken=${nextPageToken}`,
              { credentials: 'include' }
            );
            data = await response.json();
            data.users = modifiedUsers(data?.users);
            nextPageToken = data.nextPageToken;
            updateCachedData((draft) => {
              draft.users = [...draft.users, ...data.users];
              draft.nextPageToken = nextPageToken ?? '';
            });
          }
        } while (nextPageToken);
      },
    }),
    getAssignedUsers: build.query<AssignedUsersResponse, string>({
      async queryFn(arg, _, __, fetchWithBQ) {
        const url = buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.assignedUser}/assigned?${arg}`,
        });
        let assignedUsers!: AssignedUsersResponse['assignedUsers'];
        let nextPageToken!: string;
        try {
          const { data } = (await fetchWithBQ(url)) as QueryReturnValue<
            AssignedUsersResponse,
            FetchBaseQueryError
          >;
          if (data) {
            ({ assignedUsers, nextPageToken } = data);
          }
        } catch (err) {
          return { error: err as FetchBaseQueryError };
        }
        do {
          if (nextPageToken !== '') {
            const response = (await fetchWithBQ(
              `${url}&pageToken=${nextPageToken}`
            )) as QueryReturnValue<AssignedUsersResponse, FetchBaseQueryError>;
            if (response.data) {
              assignedUsers = assignedUsers.concat(response.data.assignedUsers);
              nextPageToken = response.data.nextPageToken;
            }
          }
        } while (nextPageToken);

        const assignedUserUpdate = modifiedUsers(assignedUsers);
        return {
          data: { assignedUsers: assignedUserUpdate, nextPageToken },
        } as any;
      },
    }),
    getAllUserStreamingByLeadSearch: build.query<UsersSearchResponse, string>({
      query: (params) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.searchSvc}/users?${params}&pageSize=100`,
        }),
        method: 'GET',
      }),
      transformResponse: (response: UsersSearchResponse) => {
        response.users = modifiedUsers(response?.users);
        return response;
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, getCacheEntry }
      ) {
        const params: any = {
          pageSize: 100, // Max is 100 in lead-search services
          pageFrom: 100, // Start from 100 since the first request is pageFrom 0
        };
        await cacheDataLoaded;
        const { data: { total = 0 } = {} } = getCacheEntry();
        let data: UsersSearchResponse = {} as UsersSearchResponse;
        do {
          const response = await fetch(
            `${baseUrls.salesFlow}/${
              basePaths.searchSvc
            }/users?${arg}&${new URLSearchParams(params)}`,
            { credentials: 'include' }
          );
          data = await response.json();
          updateCachedData((draft) => {
            draft.users = [...draft.users, ...data.users];
          });
          params.pageFrom += params.pageSize;
        } while (params.pageFrom <= total && data?.users?.length > 0);
      },
    }),
    getUserByParamsUsingLeadSearch: build.query<
      UsersSearchResponse,
      LeadSearchPayload
    >({
      query: ({ payload }) => {
        const queryParams = new URLSearchParams(payload);
        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: `/api/lead-search/v1alpha1/search/users?${queryParams}`,
          }),
          method: 'GET',
        };
      },
    }),
    getUserByUserId: build.query<User, string>({
      query: (user: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/user/v1alpha1/${user}?show_deleted=true`,
        }),
        method: 'GET',
      }),
    }),
    getUserRecoveryLink: build.query<any, string>({
      query: (user: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/user/v1alpha1/${user}/recovery`,
        }),
        method: 'POST',
      }),
    }),
    getUserRoles: build.query<RolesResponse, QueryProps>({
      query: (queryParams) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/roles`,
        }),
        params: { ...queryParams },
        method: 'GET',
      }),
    }),
    createUser: build.mutation<User, CreateUserRequest>({
      query: (user) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/users`,
        }),
        method: 'POST',
        body: user,
      }),
    }),
    updateUser: build.mutation<User, UpdateUserRequest>({
      query: ({ userId, userData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/${userId}`,
        }),
        method: 'PATCH',
        body: userData,
      }),
    }),
    deleteUser: build.mutation<User, string>({
      query: (userId) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/${userId}`,
        }),
        method: 'DELETE',
      }),
    }),
    unDeleteUser: build.mutation<User, string>({
      query: (userId) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.user}/${userId}:undelete`,
        }),
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,

  useGetAllUsersByStreamingQuery,
  useLazyGetAllUsersByStreamingQuery,

  useGetUserByUserIdQuery,
  useLazyGetUserByUserIdQuery,
  useGetUserRecoveryLinkQuery,
  useLazyGetUserRecoveryLinkQuery,
  useGetAssignedUsersQuery,
  useLazyGetAssignedUsersQuery,
  useGetAllUserStreamingByLeadSearchQuery,
  useLazyGetAllUserStreamingByLeadSearchQuery,
  useGetUserByParamsUsingLeadSearchQuery,

  useGetUserRolesQuery,
  useLazyGetUserRolesQuery,

  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUnDeleteUserMutation,
} = userSlice;

export default userSlice;
