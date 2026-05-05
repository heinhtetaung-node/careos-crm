import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  LookupRequest,
  SearchUserResponse,
  MatchingLeadsResponse,
  MatchingLeadsRequest,
  HistoryResponse,
  RecordObject,
} from './types';

const gffSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    searchUser: build.query<SearchUserResponse, LookupRequest>({
      query: (query) => ({
        url: buildUrl(baseUrls.goBff, {
          path: 'v1alpha1/users:autoComplete',
        }),
        params: query,
      }),
    }),
    searchUserCreateBy: build.query<SearchUserResponse, LookupRequest>({
      query: (query) => ({
        url: buildUrl(baseUrls.goBff, {
          path: 'v1alpha1/lookup/userCreateBy:autoComplete?',
        }),
        params: query,
      }),
    }),
    searchTeamCreateBy: build.query<SearchUserResponse, LookupRequest>({
      query: (query) => ({
        url: buildUrl(baseUrls.goBff, {
          path: 'v1alpha1/lookup/teamCreateBy:autoComplete',
        }),
        params: query,
      }),
    }),
    assignUserSearch: build.query<SearchUserResponse, LookupRequest>({
      query: (query) => ({
        url: buildUrl(baseUrls.goBff, {
          path: 'v1alpha1/lookup/assigned:autoComplete',
        }),
        params: query,
      }),
    }),
    searchTeams: build.query<unknown, LookupRequest>({
      query: (query) => ({
        url: buildUrl(baseUrls.goBff, {
          path: 'v1alpha1/teams:autoComplete',
        }),
        params: query,
      }),
    }),
    getMatchingLeads: build.query<
      MatchingLeadsResponse[],
      MatchingLeadsRequest
    >({
      query: ({ leadId }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `${leadId}:listMatchingLeads`,
        }),
        method: 'GET',
      }),
      transformResponse: (response: any) => response.leads,
    }),
    getHistoryBff: build.query<RecordObject, string>({
      query: (fullPath: string) => ({
        url: buildUrl(baseUrls.goBff, {
          path: fullPath,
        }),
        method: 'GET',
      }),
      transformResponse: (response: HistoryResponse) => response.record,
    }),
    getApplicationForm: build.mutation<any, any>({
      query: ({ leadId }) => ({
        url: `${basePaths.gff}/${leadId}:generateApplicationForm`,
        method: 'POST',
      }),
    }),
    sendApplicationForm: build.mutation<any, any>({
      query: ({ leadId }) => ({
        url: `${basePaths.gff}/${leadId}:sendApplicationForm`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLazySearchUserQuery,
  useLazySearchTeamCreateByQuery,
  useLazySearchUserCreateByQuery,
  useLazyAssignUserSearchQuery,
  useLazySearchTeamsQuery,
  useGetMatchingLeadsQuery,
  useGetHistoryBffQuery,
  useGetApplicationFormMutation,
  useSendApplicationFormMutation,
} = gffSlice;
