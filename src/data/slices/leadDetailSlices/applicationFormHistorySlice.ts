import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

const applicationFormHistorySlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getApplicationHistory: build.query<any, any>({
      query: (payload: any) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.lead}/leads/${payload.leadId}/application-forms`,
        }),
        params: {
          pageSize: payload.perPage,
          page_token: payload.nextPageToken,
        },
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useGetApplicationHistoryQuery } = applicationFormHistorySlice;
