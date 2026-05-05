import { apiSlice, basePaths } from 'data/slices/apiSlice';
import type { AccountCurrentProductData } from 'shared/types/policy';

export interface GetAccountPoliciesRequest {
  phoneNumber: string;
  idNumber: string;
  taxId: string;
}

export const accountPoliciesSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAccountPolicies: build.query<
      AccountCurrentProductData,
      GetAccountPoliciesRequest
    >({
      query: (body) => ({
        url: `${basePaths.gff}/policies`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetAccountPoliciesQuery, useLazyGetAccountPoliciesQuery } =
  accountPoliciesSlice;
