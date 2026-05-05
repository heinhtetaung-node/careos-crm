import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

interface PathParamProps {
  pathParam: 'provinces';
  fieldName: string;
}

const addressSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAddressData: build.query({
      query: ({ pathParam }: PathParamProps) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.address}/${pathParam}`,
        }),
      }),
      transformResponse: (response: any, _meta: any, arg: any) =>
        response[arg.fieldName],
    }),
  }),
});

export const { useLazyGetAddressDataQuery, useGetAddressDataQuery } =
  addressSlice;
