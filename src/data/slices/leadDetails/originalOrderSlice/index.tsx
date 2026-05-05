import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type OriginalOrderResponse = {
  url: string;
  originShortId: string;
};

const originalOrderSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOriginalOrder: builder.query<OriginalOrderResponse, string>({
      query: (leadId) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/${leadId}/originOrder`,
        }),
        method: 'GET',
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useGetOriginalOrderQuery } = originalOrderSlice;
