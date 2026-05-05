import { apiSlice, baseUrls } from 'data/slices/apiSlice';

type PaymentHistoryResponse = {
  paymentRecords: {
    createBy: string;
    createTime: string;
    document: string;
    expiryTime: string;
    paymentLink: string;
    message: string;
    name: string;
    status: string;
  }[];
  nextPageToken: string;
  totalCount: number;
};

type PaymentHistoryPayload = {
  leadId: string | undefined;
  nextPageToken: string | undefined;
  perPage: number;
};

const paymentHistorySlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPaymentHistory: build.query<
      PaymentHistoryResponse,
      PaymentHistoryPayload
    >({
      query: (payload: PaymentHistoryPayload) => ({
        url: `${baseUrls.goBff}/v1alpha1/leads/${payload.leadId}/payment-records`,
        params: {
          pageSize: payload.perPage,
          page_token: payload.nextPageToken,
        },
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useLazyGetPaymentHistoryQuery } = paymentHistorySlice;
