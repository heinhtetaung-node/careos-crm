import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import has from 'lodash/has';

import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  Team,
  TeamMembers,
  RolesResponse,
  ArgsProps,
  CreateTeamRequest,
  UpdateTeamRequest,
  QueryProps,
  AddMemberToTeamRequest,
  MoveMemberToTeamRequest,
  DeleteMemberFromTeamRequest,
} from './interface';

const teamSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<RolesResponse, QueryProps>({
      query: (queryParams) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: 'api/team/v1alpha1/roles',
        }),
        params: { ...queryParams },
        method: 'GET',
      }),
    }),
    getTeams: build.query<Team[], ArgsProps>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        let teams: Team[] = [];
        let teamsResource: any;

        const params: any = {
          filter: arg?.filter ?? undefined,
          pageSize: arg?.pageSize ?? 100,
        };

        do {
          if (teamsResource?.data?.nextPageToken) {
            params.pageToken = teamsResource?.data?.nextPageToken;
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            teamsResource = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.team}/teams`,
              }),
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          teams = teams.concat(teamsResource.data.teams);
        } while (
          has(teamsResource, 'data.nextPageToken') &&
          teamsResource.data.nextPageToken !== ''
        );

        return {
          data: teams,
        };
      },
    }),
    getTeamDetail: build.query<Team, string>({
      query: (teamId: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/${teamId}`,
        }),
        method: 'GET',
      }),
    }),
    addTeam: build.mutation<Team, CreateTeamRequest>({
      query: (teamData) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/teams`,
        }),
        method: 'POST',
        body: teamData,
      }),
    }),
    updateTeam: build.mutation<Team, UpdateTeamRequest>({
      query: ({ teamId, teamData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/${teamId}`,
        }),
        method: 'PATCH',
        body: teamData,
      }),
    }),
    addMemberToTeam: build.mutation<Team, AddMemberToTeamRequest>({
      query: ({ teamId, userData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/${teamId}/members`,
        }),
        method: 'POST',
        body: userData,
      }),
    }),
    getTeamMembers: build.query<TeamMembers, { filter: string }>({
      query: (params) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/teams/-/members`,
        }),
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => response?.members?.[0],
    }),
    moveMemberToTeam: build.mutation<Team, MoveMemberToTeamRequest>({
      query: ({ fullMemberResource, moveData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/${fullMemberResource}:move`,
        }),
        method: 'POST',
        body: moveData,
      }),
    }),
    deleteMemberFromTeam: build.mutation<Team, DeleteMemberFromTeamRequest>({
      query: ({ fullMemberResource }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.team}/${fullMemberResource}`,
        }),
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useLazyGetRolesQuery,

  useGetTeamsQuery,
  useLazyGetTeamsQuery,

  useGetTeamDetailQuery,
  useLazyGetTeamDetailQuery,

  useAddTeamMutation,
  useUpdateTeamMutation,

  // member endpoints
  useAddMemberToTeamMutation,
  useLazyGetTeamMembersQuery,
  useGetTeamMembersQuery,
  useMoveMemberToTeamMutation,
  useDeleteMemberFromTeamMutation,
} = teamSlice;
