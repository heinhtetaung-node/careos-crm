import { buildUrl } from 'utils/url';

import {
  CreateRenewalPackagePayload,
  CreateCustomPackageNewPayload,
  ManualPackageResponsePayload,
  CustomPackageResponsePayload,
} from './interfaces';

import { apiSlice, basePaths, baseUrls } from '../apiSlice';
import { PRODUCTS } from 'config/TypeFilter';

const apiSliceWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['PACKAGE_SEARCH'],
});

const customQuoteSlice = apiSliceWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createRenewalPackage: builder.mutation<
      unknown,
      CreateRenewalPackagePayload
    >({
      query: ({ leadId, packageData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.motor}/${leadId}/renewalPackages:upsert`,
        }),
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['PACKAGE_SEARCH'],
    }),
    createCustomPackage: builder.mutation<
      ManualPackageResponsePayload,
      CreateCustomPackageNewPayload
    >({
      query: ({ leadId, packageData }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.motor}/${leadId}/manualPackage`,
        }),
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['PACKAGE_SEARCH'],
    }),
    getCustomPackageById: builder.query<
      CustomPackageResponsePayload,
      { packageId: string; product: string }
    >({
      query: ({ packageId, product }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.motor}/${packageId}${product === PRODUCTS.HEALTH_PRODUCT_INSURANCE ? ':getQuote' : ''}`,
        }),
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useCreateRenewalPackageMutation,
  useCreateCustomPackageMutation,
  useGetCustomPackageByIdQuery,
} = customQuoteSlice;
