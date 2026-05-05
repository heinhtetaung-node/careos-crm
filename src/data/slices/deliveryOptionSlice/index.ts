import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import { DeliveryOptionsResponse } from './interface';

const deliveryOptionsSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryOptions: build.query<DeliveryOptionsResponse, void>({
      query: () => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.shipment}/deliveryOptions`,
        }),
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetDeliveryOptionsQuery, useLazyGetDeliveryOptionsQuery } =
  deliveryOptionsSlice;
