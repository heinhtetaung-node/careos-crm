import { satangToBaht } from 'utils/currency';
import { buildUrl } from 'utils/url';
import { PRODUCTS } from 'config/TypeFilter';

import {
  PackagePriceResponse,
  PriceResponse,
  RefundPayload,
  SuccessfulTransaction,
  SuccessfulTransactionApiResponse,
  TransactionFee,
  UpdateFollowupType,
} from './interface';

import { apiSlice, baseUrls, basePaths } from '../apiSlice';

const transactionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSuccessfulTransaction: builder.query<SuccessfulTransaction, string>({
      query: (leadId) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `v1alpha1/${leadId}/successfulTransactionDetails`,
        }),
        method: 'GET',
      }),
      transformResponse: (response: SuccessfulTransactionApiResponse) => {
        if (response.charges.length) {
          return {
            ...response,
            paidAmount: satangToBaht(
              response.charges[0].money?.amount
            ).toString(),
            paidDate: response.charges[0].updateTime,
            totalTransactionAmount: satangToBaht(
              response.transaction?.money?.amount
            ).toString(),
          };
        }
        throw Error('Charges are empty');
      },
    }),
    getTransactionFee: builder.query<TransactionFee, string>({
      query: (paymentId) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${paymentId}/snapshots/current`,
        }),
        method: 'GET',
      }),
      transformResponse: (transaction: TransactionFee) => {
        const { processingFeeAmount, feeAmount } =
          transaction?.priceSummary ?? {};
        if (processingFeeAmount || feeAmount) {
          return {
            ...transaction,
            priceSummary: {
              ...transaction.priceSummary,
              processingFeeAmount: satangToBaht(processingFeeAmount).toString(),
              feeAmount: satangToBaht(feeAmount).toString(),
            },
          };
        }
        throw Error('Charges are empty');
      },
    }),
    getTransactionById: builder.query<
      PriceResponse,
      { paymentId: string; product?: string }
    >({
      query: ({ paymentId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${paymentId}`,
        }),
        method: 'GET',
      }),
      transformResponse: (
        transaction: { price: PriceResponse },
        _meta,
        { product }
      ) => {
        const { price } = transaction;
        if (price?.packageResource) {
          let voluntaryPrice = 0;

          if (product === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
            voluntaryPrice = satangToBaht(price.voluntaryPrice);
          } else {
            voluntaryPrice = satangToBaht(
              price.packageResource.carPackage.packagePrice.voluntaryPrice
            );
          }
          return {
            ...price,
            invoicePrice: satangToBaht(
              price?.priceDetail?.priceSummary?.netPremiumAmount
            ),
            voluntaryPrice,
          };
        }
        throw Error('Charges are empty');
      },
    }),
    updateSMSStatus: builder.mutation<
      any,
      { uid: string; shouldSendSms: boolean }
    >({
      query: ({ uid, shouldSendSms }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${uid}`,
        }),
        method: 'PATCH',
        body: {
          send_sms: shouldSendSms,
        },
      }),
    }),
    updateFollowupStatus: builder.mutation<any, { uid: string; type: string }>({
      query: ({ uid, type }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${uid}:updateStatus`,
        }),
        method: 'PATCH',
        body: {
          status: `FOLLOWUP_STATUS_${type}`,
        },
      }),
    }),
    updateFollowup: builder.mutation<
      any,
      { uid: string; followup: UpdateFollowupType }
    >({
      query: ({ uid, followup }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${uid}`,
        }),
        method: 'PATCH',
        body: {
          ...followup,
        },
      }),
    }),
    uploadDocumentFile: builder.mutation<
      any,
      {
        file: { content_type: string; display_name: string; size: number };
        uid: string;
      }
    >({
      query: ({ file }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: basePaths.documents,
        }),
        method: 'POST',
        body: {
          content_type: file.content_type,
          display_name: file.display_name,
          size: 'MEDIUM',
        },
      }),
    }),
    createDirectPayment: builder.mutation<
      any,
      {
        data: {
          payment_method: string;
          payment_date: string;
          slip: string;
          service_provider?: string;
        };
        uid: string;
      }
    >({
      query: ({ data, uid }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${uid}:directPayment`,
        }),
        method: 'POST',
        body: {
          ...data,
        },
      }),
    }),
    assignFollowup: builder.mutation<any, { userId: string; followup: string }>(
      {
        query: ({ userId, followup }) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `${basePaths.assignment}/${followup}/assignments`,
          }),
          method: 'POST',
          body: {
            user: userId,
            kind: 'FOLLOWUP',
          },
        }),
      }
    ),
    unassignFollowup: builder.mutation<
      any,
      { userId: string; followup: string }
    >({
      query: ({ userId, followup }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.assignment}/${followup}`,
        }),
        method: 'DELETE',
        body: {
          user: userId,
          kind: 'FOLLOWUP',
        },
      }),
    }),
    sendSMS: builder.mutation<any, { uid: string; shouldSendSMS: boolean }>({
      query: ({ uid, shouldSendSMS }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.gff}/${uid}:generatePaymentLink`,
        }),
        method: 'POST',
        body: {
          send_sms: shouldSendSMS,
        },
      }),
    }),
    getPriceDetail: builder.query<PackagePriceResponse, { priceId: string }>({
      query: ({ priceId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${priceId}`,
        }),
        method: 'GET',
      }),
    }),
    getTransactionHistory: builder.query<any, { transactionId: string }>({
      query: ({ transactionId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.gff}/${transactionId}:paymentHistory`,
        }),
        method: 'GET',
      }),
    }),
    getTransactionByLeadId: builder.query<any, { leadId: string }>({
      query: ({ leadId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/transactions?filter=lead="${leadId}"`,
        }),
        method: 'GET',
      }),
    }),
    refundTransaction: builder.mutation<any, RefundPayload>({
      query: (refund) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.gff}/${refund.parent}/refunds`,
        }),
        method: 'POST',
        body: refund,
      }),
    }),
  }),
});

export const {
  useLazyGetSuccessfulTransactionQuery,
  useGetSuccessfulTransactionQuery,
  useGetTransactionFeeQuery,
  useLazyGetTransactionFeeQuery,
  useGetTransactionByIdQuery,
  useLazyGetTransactionByIdQuery,
  useUpdateSMSStatusMutation,
  useUpdateFollowupStatusMutation,
  useCreateDirectPaymentMutation,
  useAssignFollowupMutation,
  useUnassignFollowupMutation,
  useUploadDocumentFileMutation,
  useSendSMSMutation,
  useGetPriceDetailQuery,
  useUpdateFollowupMutation,
  useGetTransactionHistoryQuery,
  useGetTransactionByLeadIdQuery,
  useRefundTransactionMutation,
} = transactionSlice;
