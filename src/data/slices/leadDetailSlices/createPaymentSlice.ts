import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type CreatePaymentResponse = {
  status: string;
  message: string;
  name: string;
  paymentLink: string;
};

export interface SelectedInstallmentPlan {
  numberOfInstallments: number;
  nextMonthsInstallment: number;
  cardProvider?: string;
}
export interface CreatePaymentPayload {
  payment_option: string;
  installment_plan: number;
  payment_method: string;
  due_date: string;
  installment_amount: {
    first_month: number | undefined;
    next_month: number;
  };
  card_provider?: string;
  leadId?: string;
}

const createPaymentSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createPayment: build.mutation<CreatePaymentResponse, CreatePaymentPayload>({
      query: ({ leadId, ...rest }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/leads/${leadId}/payments`,
        }),
        method: 'POST',
        body: rest,
      }),
    }),
  }),
});

export const { useCreatePaymentMutation } = createPaymentSlice;
