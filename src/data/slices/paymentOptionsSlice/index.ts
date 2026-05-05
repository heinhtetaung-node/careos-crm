import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { getString } from 'presentation/theme/localization';
import { buildUrl } from 'utils/url';

import {
  AvailableInstallment,
  InstallmentOptionResponse,
  PaymentOptionResponse,
} from './interface';

const paymentOptionsSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getInstallmentOptions: build.query<any, string>({
      query: (leadId) => {
        return {
          url: buildUrl(baseUrls.goBff, {
            path: `/v1alpha1/${leadId}:paymentOptions`,
          }),
          method: 'GET',
        };
      },
      transformResponse: (resp: InstallmentOptionResponse) => {
        return resp.paymentOptions.map((opt) => ({
          id: opt.installments,
          value: opt.installments,
          title:
            opt.installments === 1
              ? `${getString('text.installment', {
                  installmentNumber: opt.installments,
                })}`
              : `${getString('text.installments', {
                  installmentNumber: opt.installments,
                })}`,
        }));
      },
    }),
    getPaymentOptions: build.query<PaymentOptionResponse, void>({
      query: () => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/payment-options`,
        }),
        method: 'GET',
      }),
    }),
    getInstallments: build.query<AvailableInstallment, string>({
      query: (paymentOption) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/payment-options/${paymentOption}/available-plans`,
        }),
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetInstallmentOptionsQuery,
  useGetPaymentOptionsQuery,
  useGetInstallmentsQuery,
} = paymentOptionsSlice;
