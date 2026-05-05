import { basePaths, baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';
import getFormattedURL from '../helper';
import {
  moneyToCurrency,
  numberToMoney,
  satangToBaht,
  satangToBahtNumber,
} from 'utils/currency';
import {
  formatDDMMYYYYHHMMSS,
  NewDateFormatters,
} from 'shared/helper/utilities';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';
import { showMoneyFromUnit, showPaymentPlan } from '../shared/utils';
import { cancellationReasons } from 'presentation/pages/car-insurance/OrderDetailPage/helper';
import { IRefundResponse } from './interface';

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['CANCELLATION_ALL'],
});

const cancellationSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    updateCancellationStatus: builder.mutation<any, any>({
      query: ({ request, parent, ...rest }) => ({
        url: getApiEndpoint(
          `/v1alpha1/${parent}/accounting${
            [true, false].includes(rest?.changeOrder)
              ? `?change_order=${rest?.changeOrder}`
              : ''
          }${
            [true, false].includes(rest?.createRefund)
              ? `?create_refund=${rest?.createRefund}`
              : ''
          }`,
          ServicesName.GFF
        ),
        method: 'PATCH',
        body: request,
      }),
    }),

    getAllBanks: builder.query<any, any>({
      query: () => ({
        url: `${basePaths.financialtransaction}/banks`,
        params: { pageSize: 200 },
        method: 'GET',
      }),
    }),

    getAllCancellations: builder.query<any, any>({
      query: ({ queryParams }) => {
        const params = getFormattedURL({ queryParams });
        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: basePaths.searchCancellationSvc,
          }),
          params,
          method: 'GET',
        };
      },
      providesTags: ['CANCELLATION_ALL'],
      transformResponse: (response: any) => {
        if (response?.cancellations?.length) {
          const { DDMMYYYY: DDMMYYYYBkk, DDMMYYYYHM } =
            NewDateFormatters('Asia/Bangkok');
          const data = response.cancellations.map((order: any) => {
            const orderData = order?.item;

            let changeOrder = order?.attributes?.changeOrder;
            if (changeOrder === true) {
              changeOrder = 'TRUE';
            } else if (changeOrder === false) {
              changeOrder = 'FALSE';
            }

            let customerReceivedPolicy =
              order?.accounting?.customerReceivedPolicy;
            if (customerReceivedPolicy === true) {
              customerReceivedPolicy = 'Yes';
            } else if (customerReceivedPolicy === false) {
              customerReceivedPolicy = 'No';
            }

            return {
              accounting: order?.accounting,
              actualPremiumRemittanceAmountToRCB: showMoneyFromUnit(
                order?.accounting?.actualRemittanceAmountRcb
              ),
              premiumRemittanceDateToRCB:
                DDMMYYYYBkk(order?.accounting?.remittanceRcbTime) || '-',
              actualPremiumRemittanceAmountToInsurer: showMoneyFromUnit(
                order?.accounting?.actualRemittanceAmountInsurer
              ),
              premiumRemittanceDateToInsurer:
                DDMMYYYYBkk(order?.accounting?.remittanceInsurerTime) || '-',
              premiumReturnDateFromInsurer:
                DDMMYYYYBkk(order?.accounting?.returnInsurerTime) || '-',
              premiumReturnDateFromRCB:
                DDMMYYYYBkk(order?.accounting?.returnRcbTime) || '-',
              refundAccountDocument: order?.accounting?.refundAccountDocument,
              idCardDocument: order?.accounting?.idCardDocument,

              premiumRemittanceStatus:
                order?.accounting?.premiumRemittanceStatus || '-',
              cancellationStatus: order?.accounting?.cancellationStatus || '-',
              latestPremiumRemittanceStatusDate:
                DDMMYYYYBkk(
                  order?.accounting?.latestPremiumRemittanceStatusTime
                ) || '-',
              latestPremiumReturnStatusDate:
                DDMMYYYYBkk(order?.accounting?.latestPremiumReturnStatusTime) ||
                '-',
              customerReceivePolicy: customerReceivedPolicy || '-',

              cancellationReason:
                (order?.attributes?.cancellationReason &&
                  cancellationReasons().find(
                    (reason) =>
                      reason.id === order?.attributes?.cancellationReason
                  )?.title) ||
                '-',
              changeOrderFlag: changeOrder || '-',
              paymentPlan: showPaymentPlan(
                order?.attributes?.paymentPlan,
                order?.attributes?.paymentMethod
              ),
              paymentStatus: order?.attributes?.paymentStatus,

              actualReturnAmountFromInsurer: order?.accounting
                ?.actualReturnAmountInsurer?.units
                ? numberToMoney(
                    moneyToCurrency(
                      order?.accounting?.actualReturnAmountInsurer
                    )
                  )
                : '-',
              actualReturnAmountFromRCB: order?.accounting
                ?.actualReturnAmountRcb?.units
                ? numberToMoney(
                    moneyToCurrency(order?.accounting?.actualReturnAmountRcb)
                  )
                : '-',

              cancellationContactDate:
                DDMMYYYYBkk(
                  order?.accounting?.cancellationCustomerContactTime
                ) || '-',
              policyEndDate:
                DDMMYYYYBkk(order?.accounting?.policyEndTime) || '-',
              bankAccountNumber: order?.accounting?.refundAccountNo || '-',
              bankName: order?.accounting?.refundBank || '-',

              policyReturnDate:
                DDMMYYYYBkk(order?.accounting?.policyReturnTime) || '-',
              cancellationContactedDate:
                DDMMYYYYBkk(
                  order?.accounting?.cancellationInsurerContactTime
                ) || '-',
              refundCalculationMethod:
                order?.accounting?.refundCalculationMethod || '-',

              refundAmountFromInsurer: order?.accounting?.refundInsurerAmount
                ?.units
                ? numberToMoney(
                    moneyToCurrency(order?.accounting?.refundInsurerAmount)
                  )
                : '-',
              commissionClawback: order?.accounting?.commissionClawback?.units
                ? numberToMoney(
                    moneyToCurrency(order?.accounting?.commissionClawback)
                  )
                : '-',
              refundAmountToCustomer: order?.accounting?.refundAmountCustomer
                ?.units
                ? numberToMoney(
                    moneyToCurrency(order?.accounting?.refundAmountCustomer)
                  )
                : '-',
              actualRefundAmountToCustomer: order?.accounting
                ?.actualRefundAmountCustomer?.units
                ? numberToMoney(
                    moneyToCurrency(
                      order?.accounting?.actualRefundAmountCustomer
                    )
                  )
                : '-',
              refundDate:
                DDMMYYYYBkk(order?.accounting?.refundCustomerTime) || '-',
              lastCancellationStatusDate:
                DDMMYYYYBkk(order?.accounting?.latestCancellationStatusTime) ||
                '-',
              chasisNumber: order?.attributes?.chassisNumber || '-',
              premiumReturnStatus:
                order?.accounting?.premiumReturnStatus || '-',

              policyNumber: order?.item?.policyNumber || '-',
              orderItemId: order?.item?.humanId || '-',
              orderItemName: order?.item?.name || '-',
              licensePlate: order?.attributes?.carLicensePlate || '-',
              orderCreated: DDMMYYYYHM(orderData?.createTime) || '-',
              policyStartDate: DDMMYYYYBkk(orderData?.policyStartDate) || '-',
              insuredPerson:
                order?.attributes?.policyHolder?.companyName ||
                `${order?.attributes?.policyHolder?.firstName} ${order?.attributes?.policyHolder?.lastName}`,
              totalInvoiced: formatCoverage(
                satangToBaht(orderData.grossPremium ?? 0)
              ),
            };
          });

          return {
            imports: data,
            total: response.total,
          };
        }
        return [];
      },
    }),

    getAllRefunds: builder.query<any, any>({
      query: ({ queryParams }) => {
        const params = getFormattedURL({ queryParams });
        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: basePaths.searchRefunds,
          }),
          params,
          method: 'GET',
        };
      },
      transformResponse: (response: IRefundResponse) => ({
        imports: response.refunds.map(({ refund, attributes }) => ({
          name: refund.name,
          id: refund.humanId,
          productType: attributes.product,
          orderId: attributes.orderHumanId,
          orderItemId: attributes.orderItemHumanId,
          customerFullName: attributes.customerFullName,
          customerPhone: attributes.customerPhone,
          refundAmount: numberToMoney(
            satangToBahtNumber(refund.money.amount),
            'th-TH',
            refund.money.currencyCode
          ),
          refundMethod: refund.paymentMethod,
          bankName: refund.bank,
          bankAccountNumber:
            refund.bankAccountNumber === '0' ? '-' : refund.bankAccountNumber,
          status: refund.status,
          processedAt: formatDDMMYYYYHHMMSS(refund.refundDate),
          createdAt: formatDDMMYYYYHHMMSS(refund.createTime),
          updatedAt: formatDDMMYYYYHHMMSS(refund.updateTime),
        })),
        total: response.total,
      }),
    }),
    updateRefundStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${id}`,
        }),
        method: 'PUT',
        body: {
          refund: { status },
          update_mask: 'status',
        },
      }),
    }),
    getAccountingOrderItemDocuments: builder.query<any, any>({
      query: ({ orderId, itemId }) => ({
        url: getApiEndpoint(
          `${basePaths.order}/${orderId}/documents?filter=item="${itemId} type=DOCUMENT_TYPE_ACCOUNTING_OTHERS"`
        ),
        method: 'GET',
      }),
    }),
    uploadOrderItemDocument: builder.mutation<any, any>({
      query: ({ orderId, itemId, file }) => ({
        url: getApiEndpoint(`${basePaths.order}/${orderId}/documents`),
        method: 'POST',
        body: {
          type: 'DOCUMENT_TYPE_ACCOUNTING_OTHERS',
          label: file.displayName,
          item: itemId,
          document: file.name,
        },
      }),
    }),
    deleteOrderItemDocument: builder.mutation<any, any>({
      /**
       * @param param0 documentId = /orders/123/documents/456
       * @returns
       */
      query: ({ documentId }) => ({
        url: getApiEndpoint(`${basePaths.order}/${documentId}`),
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useUpdateCancellationStatusMutation,
  useGetAllBanksQuery,
  useLazyGetAllCancellationsQuery,
  useLazyGetAllRefundsQuery,
  useUpdateRefundStatusMutation,
  useGetAccountingOrderItemDocumentsQuery,
  useLazyGetAccountingOrderItemDocumentsQuery,
  useUploadOrderItemDocumentMutation,
  useDeleteOrderItemDocumentMutation,
} = cancellationSlice;
