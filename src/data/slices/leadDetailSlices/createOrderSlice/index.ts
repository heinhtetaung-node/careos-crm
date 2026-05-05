import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type CreateOrderRequest = {
  leadId: string;
  form?: any;
};

const createOrderSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<any, CreateOrderRequest>({
      query: ({ leadId, form }) => {
        return {
          url: buildUrl(baseUrls.goBff, {
            path: `/v1alpha1/${leadId}:createOrderWithPricing`,
          }),
          method: 'POST',
          body: form,
        };
      },
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useCreateOrderMutation } = createOrderSlice;
