import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  GetCampaignResponse,
  GetCampaignRequest,
  GetApproverResponse,
  GetApproverRequest,
  GetPricingPaymentOptionsRequest,
  GetPricingPaymentOptionsResponse,
  CreatePackageResponse,
  CreatePackageRequest,
  UpdatePackageRequest,
  GetVoucherRequest,
  GetCustomPackageRequest,
} from './interface';

const discountAndPricingSlice = apiSlice
  .enhanceEndpoints({ addTagTypes: ['PACKAGE_SEARCH'] })
  .injectEndpoints({
    endpoints: (build) => ({
      getDiscountCampaigns: build.query<
        GetCampaignResponse,
        GetCampaignRequest
      >({
        query: ({ leadId, packageId, discountType }) => ({
          url: buildUrl(baseUrls.goBff, {
            path: `v1alpha1/${leadId}/${packageId}:discountDetails`,
          }),
          method: 'GET',
          params: {
            discountType,
          },
        }),
        transformResponse: (response: any) => response.campaigns,
      }),

      getApprover: build.query<GetApproverResponse, GetApproverRequest>({
        query: ({ queryParams }) => ({
          url: buildUrl(baseUrls.goBff, {
            path: `v1alpha1:getDiscountApprover`,
          }),
          method: 'GET',
          params: queryParams,
        }),
      }),

      getPricingPaymentOptions: build.query<
        GetPricingPaymentOptionsResponse,
        GetPricingPaymentOptionsRequest
      >({
        query: ({ leadId, packageId, queryParams }) => ({
          url: buildUrl(baseUrls.goBff, {
            path: `v1alpha1/${leadId}/${packageId}:getPaymentOptions`,
          }),
          method: 'GET',
          params: queryParams,
        }),
      }),

      createPackage: build.mutation<
        CreatePackageResponse,
        CreatePackageRequest
      >({
        query: ({ resourceId, payload }) => ({
          url: buildUrl(baseUrls.goBff, {
            path: `v1alpha1/${resourceId}/customPackages`,
          }),
          method: 'POST',
          body: payload,
        }),
        invalidatesTags: ['PACKAGE_SEARCH'],
      }),

      updatePackage: build.mutation<unknown, UpdatePackageRequest>({
        query: ({ packageId, payload }) => ({
          url: buildUrl(baseUrls.goBff, { path: `v1alpha1/${packageId}` }),
          method: 'PATCH',
          body: payload,
        }),
        invalidatesTags: ['PACKAGE_SEARCH'],
      }),

      deletePackage: build.mutation<unknown, string>({
        query: (packageId) => ({
          url: buildUrl(baseUrls.goBff, {
            path: `v1alpha1/${packageId}`,
          }),
          method: 'DELETE',
        }),
        invalidatesTags: ['PACKAGE_SEARCH'],
      }),
      getVoucher: build.mutation<unknown, GetVoucherRequest>({
        query: ({
          packageId,
          lead,
          numberOfInstallments,
          discountPercentage,
        }) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `api/discount/v1/incentiveVouchers:checkEligibility`,
          }),
          method: 'POST',
          body: {
            package: packageId,
            lead,
            numberOfInstallments,
            discountPercentage,
          },
        }),
      }),
      getCustomPackage: build.mutation<unknown, GetCustomPackageRequest>({
        query: ({ packageId }) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `api/car-package/v1alpha1/${packageId}:getQuote`,
          }),
          method: 'GET',
        }),
      }),
    }),
  });

export const {
  useLazyGetDiscountCampaignsQuery,
  useLazyGetApproverQuery,
  useLazyGetPricingPaymentOptionsQuery,
  useDeletePackageMutation,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useGetVoucherMutation,
  useGetCustomPackageMutation,
} = discountAndPricingSlice;
