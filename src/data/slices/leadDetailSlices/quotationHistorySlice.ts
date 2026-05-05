import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type QuotationHistoryResponse = {
  quotations: {
    createBy: string;
    createTime: string;
    document: string;
    expirtTime: string;
    link: string;
    name: string;
  }[];
  nextPageToken: string;
};

const quotationHistorySlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getQuotationHistory: build.query<QuotationHistoryResponse, string>({
      query: (leadId) =>
        buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.lead}/leads/${leadId}/quotations?page_size=20`,
        }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useGetQuotationHistoryQuery } = quotationHistorySlice;
