import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import _camelCase from 'lodash/camelCase';

import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import { getString } from 'presentation/theme/localization';
import { buildUrl } from 'utils/url';

type ConfirmRejectionRequest = {
  approve: boolean;
  rejections: string[];
};

interface RejectionReasonAPIResponse {
  rejectReasons: string[];
}

interface Rejection {
  id: number;
  value: string;
  title: string;
}

type RejectionReasonResponse = Array<Rejection>;

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['POST'] });

const rejectionSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getRejectionReasons: build.query<RejectionReasonResponse, void>({
      query: () => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: '/api/reject/v1alpha1/rejections:reasons',
        }),
        method: 'GET',
      }),
      transformResponse: (response: RejectionReasonAPIResponse) =>
        response.rejectReasons.map((reason: string, index: number) => ({
          id: index,
          value: reason,
          title: getString(`rejectReason.${_camelCase(reason)}`),
        })),
    }),
    getLeadRejectionById: build.query<any, string>({
      query: (leadId: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `api/reject/v1alpha1/${leadId}/rejections`,
        }),
        method: 'GET',
      }),
      providesTags: ['POST'],
    }),
    postLeadRejection: build.mutation<any, any>({
      query: ({ leadId, ...rest }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `api/reject/v1alpha1/${leadId}/rejections`,
        }),
        method: 'POST',
        body: { ...rest },
      }),
      invalidatesTags: ['POST'],
    }),
    confirmRejection: build.mutation<any, ConfirmRejectionRequest>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const requestPromises = _arg.rejections.map((rejection) =>
          fetchWithBQ({
            url: buildUrl(baseUrls.salesFlow, {
              path: `${basePaths.rejections}/${rejection}:decide`,
            }),
            method: 'POST',
            body: {
              name: rejection,
              approve: _arg.approve,
            },
          })
        );
        const responses = await Promise.all(requestPromises);
        const errorResponses = responses.filter(
          (response) => 'error' in response
        );

        if (errorResponses.length > 0) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data: errorResponses,
              error: errorResponses
                .map((res: any) => res.error.data.message)
                .join('\n'),
            } as FetchBaseQueryError,
          };
        }
        return {
          data: {
            data: responses,
            message: 'Success',
          },
        };
      },
    }),
  }),
});

export const {
  useLazyGetRejectionReasonsQuery,
  useGetRejectionReasonsQuery,
  useGetLeadRejectionByIdQuery,
  usePostLeadRejectionMutation,
  useConfirmRejectionMutation,
} = rejectionSlice;
