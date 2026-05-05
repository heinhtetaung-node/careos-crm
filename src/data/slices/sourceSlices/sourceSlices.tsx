import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import has from 'lodash/has';

import { apiSlice, basePaths, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

const LOOP_BREAK_LIMIT = 20;

type Sources = Source[];

type Source = {
  medium: string;
  campaign: string;
  source: string;
  online: boolean;
  name?: string;
  createByFullName: string;
  updateByFullName?: string;
};

type Config = {
  product?: string;
  pageSize?: number;
  onlyOnlineSource?: boolean;
  filter?: string;
  useLeadSearchService?: boolean;
} | void;

const sourceSlices = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getSources: build.query<Sources, Config>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let sources: Sources = [];
        let sourceResponse: any;

        const params: any = {
          filter: _arg?.onlyOnlineSource ? 'online=true' : undefined,
          pageSize: 100,
        };
        do {
          if (sourceResponse?.data?.nextPageToken) {
            params.pageToken = sourceResponse?.data?.nextPageToken;
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            sourceResponse = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: _arg?.useLeadSearchService
                  ? `${basePaths.searchSvc}/sources`
                  : `${basePaths.view}/views/sources/sources`,
              }),
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          sources = sources.concat(sourceResponse.data.sourcesWithScore);
        } while (
          has(sourceResponse, 'data.nextPageToken') &&
          sourceResponse.data.nextPageToken !== ''
        );

        return {
          data: sources,
        };
      },
    }),
    getSourcesV2: build.query<Sources, Config>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let sources: Sources = [];
        let sourceResponse: any;

        const params: any = {
          filter: `${_arg?.onlyOnlineSource ? 'online=true' : ''}${_arg?.product ? `sourceWithScore.product="${_arg.product}"` : ''}`,
          pageSize: 1000,
          orderBy: 'sourceWithScore.createTime desc',
        };
        let count = 0;
        do {
          try {
            // eslint-disable-next-line no-await-in-loop
            sourceResponse = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.searchSvc}/sources`,
              }),
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          sources = sources.concat(sourceResponse.data.sourcesWithScore);
          params.pageFrom = sources.length;
          count += 1;
          if (count > LOOP_BREAK_LIMIT) {
            break;
          }
        } while (sources.length < parseInt(sourceResponse?.data?.total, 10));

        return {
          data: sources,
        };
      },
    }),
    getSourcesLeadService: build.query<Sources, Config>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let sources: Sources = [];
        let sourceResponse: any;

        const params: any = {
          filter: _arg?.filter || undefined,
          pageSize: _arg?.pageSize || 100,
        };
        do {
          if (sourceResponse?.data?.nextPageToken) {
            params.pageToken = sourceResponse?.data?.nextPageToken;
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            sourceResponse = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.lead}/sources`,
              }),
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          sources = sources.concat(sourceResponse.data.sources);
        } while (
          has(sourceResponse, 'data.nextPageToken') &&
          sourceResponse.data.nextPageToken !== ''
        );

        return {
          data: sources,
        };
      },
    }),
    getLeadSource: build.query<Source, { sourceName: string }>({
      query: ({ sourceName }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `api/lead/v1alpha2/${sourceName}`,
        }),
        method: 'GET',
      }),
    }),
    createSource: build.mutation<unknown, unknown>({
      query: (body) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.lead}/sources`,
        }),
        method: 'POST',
        body,
      }),
    }),
    updateSource: build.mutation<unknown, unknown>({
      query: ({ name, ...body }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.lead}/${name}`,
        }),
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useGetSourcesQuery,
  useGetSourcesV2Query,
  useLazyGetSourcesQuery,
  useGetSourcesLeadServiceQuery,
  useLazyGetSourcesLeadServiceQuery,
  useGetLeadSourceQuery,
  useLazyGetLeadSourceQuery,
  useCreateSourceMutation,
  useUpdateSourceMutation,
} = sourceSlices;
