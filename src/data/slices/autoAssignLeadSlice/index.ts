/* eslint-disable arrow-body-style */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { basePaths, apiSlice } from 'data/slices/apiSlice';
import { getString } from 'presentation/theme/localization';
import { formatDDMMYYYYHHMMSS, formatDDMMYYYY } from 'shared/helper/utilities';
import { bahtToSatang, satangToBaht } from 'utils/currency';

import { getFormattedURL } from './helper';
import {
  AssignmentParams,
  AutoAssignSetting,
  AutoAssignLeadResponse,
  AutoAssignLeadPayload,
  CustomAutoLeadResponse,
  AutoAssignConfigPayload,
  UpdateAgentStatusResponse,
  GetAutoAssignSettingResponse,
} from './types';

const getFormatedAutoAssignResponse = (
  data: AutoAssignLeadResponse['assignments']
) => {
  return data.map((_data) => {
    const { config, team, user, attributes } = _data;
    const assignedLeadPercent =
      ((attributes?.assignedLeadCount as number) / config.quota) * 100;
    return {
      id: user?.name,
      teamId: team?.name,
      configId: config.name,
      status: config.absent
        ? getString('text.absent')
        : getString('text.present'),
      displayName: team?.displayName ?? '-',
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.humanId,
      tier: config.tier,
      dailyQuota: config.quota,
      assignedLeadCount:
        attributes?.assignedLeadCount != null
          ? `${attributes.assignedLeadCount} (${assignedLeadPercent.toFixed(
              2
            )}%)`
          : `${assignedLeadPercent.toFixed(2)}%`,

      lastImport: formatDDMMYYYYHHMMSS(config?.createTime ?? ''),
      effectiveDate: formatDDMMYYYY(config.effectiveDate),
      sundayAgent: config?.sundayAgent ? 'Yes' : '-',
    };
  });
};

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['AUTO_ASSIGN'],
});

const autoAssignleadSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getAutoAssignLeads: build.query<
      CustomAutoLeadResponse,
      AutoAssignLeadPayload
    >({
      query: (payload) => {
        return {
          url: `${basePaths.searchSvc}/autoassignments?${getFormattedURL(
            payload
          )}`,
          method: 'GET',
        };
      },
      providesTags: ['AUTO_ASSIGN'],
      transformResponse: (resp: AutoAssignLeadResponse) => {
        if (!resp?.assignments || !resp?.assignments?.length)
          return { imports: [] };
        return {
          imports: getFormatedAutoAssignResponse(resp.assignments),
          total: resp.total,
        };
      },
    }),
    getAllAutoAssignLeads: build.query<
      CustomAutoLeadResponse['imports'][],
      any
    >({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let leads: CustomAutoLeadResponse['imports'][] = [];
        let leadResponse: any;

        const params: any = {
          pageSize: 100,
          pageFrom: 0,
        };

        do {
          try {
            // eslint-disable-next-line no-await-in-loop
            leadResponse = await fetchWithBQ({
              url: `${basePaths.searchSvc}/autoassignments`,
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          leads = leads.concat(
            getFormatedAutoAssignResponse(leadResponse?.data?.assignments)
          );
          params.pageFrom += params.pageSize;
        } while (
          leadResponse?.data?.assignments?.length > 0 &&
          params.pageFrom <= leadResponse?.data?.total
        );

        return {
          data: leads,
        };
      },
    }),
    updateAgentStatus: build.mutation<
      UpdateAgentStatusResponse,
      AutoAssignConfigPayload
    >({
      query: ({ id, absent }) => ({
        url: `${basePaths.autoAssign}/${id}`,
        method: 'PATCH',
        body: {
          absent,
        },
      }),
    }),
    getAutoAssignSettings: build.query<AssignmentParams, any>({
      query: () => {
        return {
          url: `${basePaths.autoAssign}/products/car-insurance/parameters`,
          method: 'GET',
        };
      },
      transformResponse: (resp: GetAutoAssignSettingResponse) => {
        const response = resp?.parameters?.[0].motorAssignmentParams;

        return {
          ...response,
          premiumLeadThreshold: satangToBaht(response.premiumLeadThreshold),
        };
      },
    }),
    updateAutoAssignSettings: build.mutation<
      AutoAssignSetting,
      AssignmentParams
    >({
      query: (payload) => {
        return {
          url: `${basePaths.autoAssign}/parameters`,
          method: 'POST',
          body: {
            product: 'products/car-insurance',
            motorAssignmentParams: {
              ...payload,
              premiumLeadThreshold: bahtToSatang(payload.premiumLeadThreshold),
            },
          },
        };
      },
      invalidatesTags: ['AUTO_ASSIGN'],
    }),
  }),
});

export const {
  useLazyGetAutoAssignLeadsQuery,
  useUpdateAgentStatusMutation,
  useLazyGetAutoAssignSettingsQuery,
  useUpdateAutoAssignSettingsMutation,
  useGetAllAutoAssignLeadsQuery,
  useLazyGetAllAutoAssignLeadsQuery,
} = autoAssignleadSlice;
