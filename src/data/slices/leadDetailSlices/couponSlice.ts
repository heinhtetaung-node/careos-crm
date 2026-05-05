import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type AddCouponPayload = {
  leadId: string;
  coupon: string;
};

const apiWithTags = apiSlice.enhanceEndpoints({
  addTagTypes: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION'],
});

const couponSlice = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    addCoupon: builder.mutation<any, AddCouponPayload>({
      query: ({ leadId, coupon }) => {
        return {
          url: buildUrl(baseUrls.goBff, {
            path: `/v1alpha1/leads/${leadId}:addVoucher`,
          }),
          method: 'POST',
          body: { parent: `leads/${leadId}`, voucherCode: coupon },
        };
      },
      invalidatesTags: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION'],
    }),
    deleteCoupon: builder.mutation<any, string>({
      query: (leadId) => {
        return {
          url: buildUrl(baseUrls.goBff, {
            path: `/v1alpha1/leads/${leadId}:removeVoucher`,
          }),
          method: 'POST',
          body: { parent: `leads/${leadId}` },
        };
      },
      invalidatesTags: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION'],
    }),
  }),
});

export const { useAddCouponMutation, useDeleteCouponMutation } = couponSlice;
