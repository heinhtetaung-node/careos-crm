import omit from 'lodash/omit';

import { apiSlice, basePaths } from 'data/slices/apiSlice';
import getApiEndpoint from 'utils/endpointHelper';

import {
  QcQuestionsDataResponse,
  QCSavePayload,
  QCGetPayload,
  QcAddonsDataResponse,
} from './interface';

const qcSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getQCAnswers: build.query<QcQuestionsDataResponse, QCGetPayload>({
      query: ({ orderId }) => ({
        url: `${basePaths.order}/orders/${orderId}:getQC`,
        method: 'GET',
      }),
    }),
    getQCAddOns: build.query<QcAddonsDataResponse, QCGetPayload>({
      query: ({ orderId }) => ({
        url: getApiEndpoint(
          `api/order/v1alpha1/orders/${orderId}/items/-/addons`
        ),
        method: 'GET',
      }),
    }),
    updateQCAnswers: build.mutation<QcQuestionsDataResponse, QCSavePayload>({
      query: (body) => ({
        url: `${basePaths.order}/${body.name}:qc`,
        method: 'POST',
        body: omit(body, 'name'),
      }),
    }),
  }),
});

export const {
  useGetQCAnswersQuery,
  useLazyGetQCAddOnsQuery,
  useUpdateQCAnswersMutation,
} = qcSlice;
