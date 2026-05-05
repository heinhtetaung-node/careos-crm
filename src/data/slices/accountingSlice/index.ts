import { basePaths, baseUrls, apiSlice } from 'data/slices/apiSlice';

import { buildUrl } from 'utils/url';
import getFormattedURL from '../helper';
import { satangToBaht } from 'utils/currency';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';
import { NewDateFormatters } from 'shared/helper/utilities';
import { showPaymentPlan, showMoneyFromUnit } from '../shared/utils';

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['ACCOUNTING'] });

export const accountingSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getAllItems: build.query<any, any>({
      query: ({ queryParams }) => {
        const params = getFormattedURL({ queryParams });
        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: basePaths.searchAccoungingSvc,
          }),
          params,
          method: 'GET',
        };
      },
      providesTags: ['ACCOUNTING'],
      transformResponse: (response: any) => {
        if (response?.accountings?.length) {
          const { DDMMYYYY: DDMMYYYYBkk, DDMMYYYYHM } =
            NewDateFormatters('Asia/Bangkok');
          const data = response.accountings.map((item: any) => ({
            id: item?.item?.humanId || '-',
            policyNumber: item?.item?.policyNumber || '-',
            cancellationStatus: item?.accounting?.cancellationStatus || '-',
            premium: formatCoverage(
              satangToBaht(item?.item?.grossPremium ?? 0)
            ),
            insuredPersonName:
              item?.attributes?.policyHolder?.companyName ||
              `${item?.attributes?.policyHolder?.firstName} ${item?.attributes?.policyHolder?.lastName}`,
            licensePlate: item?.attributes?.carLicensePlate || '-',
            chassisNumber: item?.attributes?.chassisNumber || '-',
            orderCreateDate: DDMMYYYYHM(item?.item?.createTime) || '-',
            policyStartDate: DDMMYYYYBkk(item?.item?.policyStartDate) || '-',
            paymentPlan: showPaymentPlan(
              item?.attributes?.paymentPlan,
              item?.attributes?.paymentMethod
            ),
            paymentStatus: item?.attributes?.paymentStatus,
            actualPremiumRemittanceAmountToRCB: showMoneyFromUnit(
              item?.accounting?.actualRemittanceAmountRcb
            ),
            premiumRemittanceStatus:
              item?.accounting?.premiumRemittanceStatus ?? '-',
            premiumRemittanceDateToRCB:
              DDMMYYYYBkk(item?.accounting?.remittanceRcbTime) || '-',
            actualPremiumRemittanceAmountToInsurer: showMoneyFromUnit(
              item?.accounting?.actualRemittanceAmountInsurer
            ),
            premiumRemittanceDateToInsurer:
              DDMMYYYYBkk(item?.accounting?.remittanceInsurerTime) || '-',
            premiumReturnStatus: item?.accounting?.premiumReturnStatus || '-',
            latestPremiumRemittanceStatusDate:
              DDMMYYYYBkk(
                item?.accounting?.latestPremiumRemittanceStatusTime
              ) || '-',
            latestPremiumReturnStatusDate:
              DDMMYYYYBkk(item?.accounting?.latestPremiumReturnStatusTime) ||
              '-',
            actualReturnAmountFromInsurer: showMoneyFromUnit(
              item?.accounting?.actualReturnAmountInsurer
            ),
            premiumReturnDateFromInsurer:
              DDMMYYYYBkk(item?.accounting?.returnInsurerTime) || '-',
            actualReturnAmountFromRCB: showMoneyFromUnit(
              item?.accounting?.actualReturnAmountRcb
            ),
            premiumReturnDateFromRCB:
              DDMMYYYYBkk(item?.accounting?.returnRcbTime) || '-',
            policyEndDate: DDMMYYYYBkk(item?.accounting?.policyEndTime) || '-',
            refundCalculationMethod:
              item?.accounting?.refundCalculationMethod || '-',
            refundAmountFromInsurer: showMoneyFromUnit(
              item?.accounting?.refundInsurerAmount
            ),
            commissionClawback: showMoneyFromUnit(
              item?.accounting?.commissionClawback
            ),
            refundAmountToCustomer: showMoneyFromUnit(
              item?.accounting?.refundAmountCustomer
            ),
            actualRefundAmountToCustomer: showMoneyFromUnit(
              item?.accounting?.actualRefundAmountCustomer
            ),
            refundDate:
              DDMMYYYYBkk(item?.accounting?.refundCustomerTime) || '-',
          }));
          return {
            imports: data,
            total: response.total,
          };
        }
        return [];
      },
    }),
    getAccounting: build.query<any, any>({
      query: ({ orderItemId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.order}/${orderItemId}/accounting`,
        }),
        method: 'GET',
      }),
    }),
    getCancellationData: build.query<any, any>({
      query: ({ orderItemId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${orderItemId}/cancellation-details`,
        }),
      }),
    }),
  }),
});

export const {
  useGetAllItemsQuery,
  useLazyGetAllItemsQuery,
  useGetAccountingQuery,
  useLazyGetAccountingQuery,
  useGetCancellationDataQuery,
} = accountingSlice;
