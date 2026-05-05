import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type LeadPackageResponse = {
  first_installment: number;
  insurance_category: string;
  invoice_price: number;
  mandatory_gross_premium: number;
  new_customer_discount: number;
  package_id: number;
  price: number;
  price_without_discount: number;
  remaining_installment: number;
  renewal_customer_discount: number;
  sum_insured: number;
  voluntary_gross_premium: number;
  voucher_discount: number;
};

const leadPackageSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getLeadPackage: build.query<LeadPackageResponse, string>({
      query: (leadId) =>
        buildUrl(baseUrls.bff, {
          path: `api/leads/${leadId}/package`,
        }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useLazyGetLeadPackageQuery } = leadPackageSlice;
