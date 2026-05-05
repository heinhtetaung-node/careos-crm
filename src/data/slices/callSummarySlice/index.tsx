import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import { CallSummaryModalPayload } from './interface';

import { apiSlice } from '../apiSlice';

const callSummarySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCallSummary: builder.mutation<any, CallSummaryModalPayload>({
      query: (request) => ({
        url: getApiEndpoint(
          `/v1alpha1/${request.parent}:saveCallSummary`,
          ServicesName.GFF
        ),
        method: 'POST',
        body: request,
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useCreateCallSummaryMutation } = callSummarySlice;
