import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import * as CONSTANTS from 'shared/constants';
import { buildUrl } from 'utils/url';

const smsSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    fetchSMSes: build.query({
      query: ({ leadId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/sms/v1alpha1/leads/${leadId}/smses?pageSize=${CONSTANTS.ATTACHMENT_PAGE_SIZE}`,
        }),
        method: 'GET',
      }),
    }),
    sendSms: build.mutation<any, any>({
      query: ({ leadId, payload }) => ({
        url: `${basePaths.sms}/${leadId}/sms`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useFetchSMSesQuery, useSendSmsMutation } = smsSlice;
