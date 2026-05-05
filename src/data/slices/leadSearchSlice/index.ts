import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import _omit from 'lodash/omit';

import { formatOneLead } from 'presentation/redux/reducers/leads/lead-assignment';
import { buildUrl } from 'utils/url';

import { formatResponseByType, getProvidedTagsByType } from './helper';
import {
  FormattedLeadSearchResponse,
  isQuerySuccess,
  LeadSearchRequest,
  GenericSearchResponse,
  GenericSearchRequest,
} from './interface';
import {
  SearchContractDataResponse,
  SearchCarepayChargesResponse,
  SearchCarePayTransactionResponse,
} from './types';

import { apiSlice, basePaths, baseUrls } from '../apiSlice';
import getFormattedUrl from '../helper';
import commentsSlice from '../leadDetails/commentsSlice';

const apiSliceWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['CONTRACT'],
});

const leadSearchSlice = apiSliceWithTag.injectEndpoints({
  endpoints: (build) => ({
    searchLead: build.query<
      FormattedLeadSearchResponse<ReturnType<typeof formatOneLead>[]>,
      LeadSearchRequest
    >({
      async queryFn(arg, { dispatch }, extraOptions, baseQuery) {
        const response: any = await baseQuery({
          url: buildUrl(baseUrls.salesFlow, { path: basePaths.searchSvc }),
          method: 'GET',
          params: _omit(arg, ['withRejectionComment', 'currentUser']),
        });
        if (isQuerySuccess(response)) {
          const transformedPromises = response.data?.leads.map(
            async (lead: any) => {
              const transformedLead = formatOneLead(
                lead,
                arg?.currentUser?.role
              );
              if (arg.withRejectionComment) {
                const comment = await dispatch(
                  commentsSlice.endpoints.getComment.initiate(
                    transformedLead?.commentId as string
                  )
                );
                transformedLead.rejectionComment = comment.data?.text ?? '';
              }
              return transformedLead;
            }
          );
          return {
            meta: response.meta,
            data: {
              leads: await Promise.all(transformedPromises as any[]),
              total: Number(response.data?.total),
            },
          };
        }
        return {
          meta: response.meta,
          error: response.error as FetchBaseQueryError,
        };
      },
    }),
    genericSearch: build.query<any, GenericSearchRequest>({
      query: ({ queryParams }) => {
        const { type, ...rest } = queryParams;
        const params = getFormattedUrl({ queryParams: rest });

        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: `${basePaths.searchSvc}/${type}`,
          }),
          params,
          method: 'GET',
        };
      },
      transformResponse: (
        response:
          | GenericSearchResponse
          | SearchCarepayChargesResponse
          | SearchContractDataResponse
          | SearchCarePayTransactionResponse,
        _meta,
        args: any
      ) => {
        // transformation is done in columns of useTableList for other tableType
        const { tableType } = args;
        return formatResponseByType(tableType, response);
      },
      providesTags: (_result, _error, arg) =>
        getProvidedTagsByType(arg.queryParams.type),
    }),
    getAllUsers: build.query<any[], void>({
      async queryFn(_arg, _, __, fetchWithBQ) {
        const url = buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.searchSvc}/users`,
        });
        const userList = [];
        let response: any;
        let pageFrom = 0;
        do {
          // eslint-disable-next-line no-await-in-loop
          response = await fetchWithBQ({
            url,
            method: 'GET',
            params: {
              page_from: pageFrom,
              pageSize: 1000,
            },
          });
          if (response.error) {
            return { error: response.error };
          }
          pageFrom += 100;
          userList.push(...response.data.users);
        } while (userList.length < parseInt(response.data.total, 10));
        return { data: userList };
      },
    }),
  }),
});

export const {
  useLazySearchLeadQuery,
  useLazyGenericSearchQuery,
  useGenericSearchQuery,
  useGetAllUsersQuery,
} = leadSearchSlice;
