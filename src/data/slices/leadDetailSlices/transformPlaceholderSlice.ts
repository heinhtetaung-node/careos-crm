import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type TransformPlaceholderPayload = {
  leadId: string;
  payload: {
    body: string;
    locale: string;
    filter: string;
  };
};

type TransformPlaceholderResponse = {
  text: string;
};

const transformPlaceholderSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    transformPlaceholder: builder.mutation<
      TransformPlaceholderResponse,
      TransformPlaceholderPayload
    >({
      query: ({ leadId, payload }) => ({
        url: buildUrl(baseUrls.bff, {
          path: `api/leads/${leadId}/transform-placeholders`,
        }),
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useTransformPlaceholderMutation } = transformPlaceholderSlice;
