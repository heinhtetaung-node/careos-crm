import { AnyObject } from 'yup';

import { apiSlice, basePaths, baseUrls } from 'data/slices/apiSlice';
import {
  Lead,
  LeadPaymentInformation,
  NewLeadPaymentInformation,
} from 'shared/types/lead';

import {
  CustomerResponse,
  LeadConnectPayload,
  UpdateLeadResponse,
} from './types';

const apiWithTags = apiSlice.enhanceEndpoints({
  addTagTypes: ['PACKAGE_SELECTION', 'LEAD'],
});

const leadSlice = apiWithTags.injectEndpoints({
  endpoints: (build) => ({
    connectLeadToCustomer: build.mutation<CustomerResponse, LeadConnectPayload>(
      {
        query: ({ customerId, lead }) => ({
          url: `${basePaths.customer}/${customerId}/leads`,
          method: 'POST',
          body: { lead },
        }),
      }
    ),
    updateLead: build.mutation<
      UpdateLeadResponse,
      { leadId: string; data: AnyObject }
    >({
      query: ({ leadId, data }) => ({
        url: `${basePaths.lead}/${leadId}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    getLeadByID: build.query<Lead, string>({
      query: (leadName) => ({
        url: `${basePaths.lead}/leads/${leadName}`,
        method: 'GET',
      }),
      providesTags: ['PACKAGE_SELECTION', 'LEAD'],
    }),
    getNewLeadPaymentDetails: build.query<NewLeadPaymentInformation, string>({
      query: (leadName) => ({
        url: `${basePaths.financialtransaction}/leads/${leadName}/paymentDetails`,
        method: 'GET',
      }),
      providesTags: ['PACKAGE_SELECTION', 'LEAD'],
    }),
    getNewLeadPaymentDetailsWithOrderItemId: build.query<
      NewLeadPaymentInformation,
      { leadIdFromOrder: string | null; orderItemId: string }
    >({
      query: ({ leadIdFromOrder, orderItemId }) => ({
        url: `${basePaths.financialtransaction}/leads/${leadIdFromOrder}/paymentDetails/${orderItemId}`,
        method: 'GET',
      }),
      providesTags: ['PACKAGE_SELECTION', 'LEAD'],
    }),
    getPaymentRefund: build.query<NewLeadPaymentInformation, string>({
      query: (orderItemId) => ({
        url: `${basePaths.financialtransaction}/transactions/-/refunds?filter=orderItem="${orderItemId}"`,
        method: 'GET',
      }),
      providesTags: ['LEAD'],
    }),
    getLeadPaymentDetails: build.query<LeadPaymentInformation, string>({
      query: (leadName) => ({
        url: `${baseUrls.goBff}/v1alpha1/leads/${leadName}:paymentDetails`,
        method: 'GET',
      }),
      providesTags: ['PACKAGE_SELECTION', 'LEAD'],
    }),
    getLeadContractDetails: build.query<LeadPaymentInformation, string>({
      query: (leadName) => ({
        url: `${baseUrls.goBff}/v1alpha1/leads/${leadName}:contractDetails`,
        method: 'GET',
      }),
      providesTags: ['PACKAGE_SELECTION', 'LEAD'],
    }),
  }),
});

export const {
  useConnectLeadToCustomerMutation,
  useUpdateLeadMutation,
  useLazyGetLeadByIDQuery,
  useGetLeadByIDQuery,
  useGetLeadPaymentDetailsQuery,
  useGetNewLeadPaymentDetailsQuery,
  useGetNewLeadPaymentDetailsWithOrderItemIdQuery,
  useGetLeadContractDetailsQuery,
  useGetPaymentRefundQuery,
} = leadSlice;
