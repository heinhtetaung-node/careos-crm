import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import { ICallSummaryResponse, ICallSummaryRequest } from './interface';

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['GET'] });

const callSummarySlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getCallSummary: build.query<ICallSummaryResponse, ICallSummaryRequest>({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        const { id } = _args;

        const callSummary: any = await fetchWithBQ(
          buildUrl(baseUrls.salesFlow, {
            path: `/api/gff/v1alpha1/${id}/callStats`,
          })
        );
        try {
          if (callSummary?.data) {
            return {
              data: {
                callSummary: callSummary.data,
              },
            };
          }
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
        return { error: callSummary.error as FetchBaseQueryError };
      },
    }),
  }),
});
// eslint-disable-next-line import/prefer-default-export
export const { useLazyGetCallSummaryQuery } = callSummarySlice;
