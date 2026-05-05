import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import WebSocketGateway from 'data/gateway/websocket';
import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import { generateParams } from './helper';
import {
  GetPackagesRequest,
  GetPackagesResponse,
  GenerateQuotationPayload,
  GenerateLinkRequestPayload,
  GenerateLinkResponsePayload,
  SumInsuredRangeResponse,
  GetSelectedPackageResponse,
  SelectPackageRequest,
  InsurerSumInsuredRangeResponse,
  GenerateQuotationResponse,
  CustomPackageWebsocketMessage,
} from './interfaces';

const apiWithTags = apiSlice.enhanceEndpoints({
  addTagTypes: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION'],
});

export const packageListingSlice = apiWithTags.injectEndpoints({
  endpoints: (build) => ({
    getPackages: build.query<GetPackagesResponse, GetPackagesRequest>({
      query: ({
        leadId,
        productType,
        sumInsuredMax,
        sumInsuredMin,
        paymentOption,
        installment,
        healthPackageFilter,
        ...rest
      }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/leads/${leadId}/packages:searchWithPricing${healthPackageFilter ? `?${healthPackageFilter}` : ''}`,
        }),
        method: 'GET',
        params: generateParams({
          productType,
          sumInsuredMax,
          sumInsuredMin,
          paymentOption,
          installment,
          ...rest,
        }),
      }),
      transformResponse: (response: any, _meta) =>
        response?.packages || response?.healthPackages,
      providesTags: ['PACKAGE_SEARCH'],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        let subscription: Subscription | undefined;
        const ws = WebSocketGateway.getInstance()
          .subscribe(`carpackage/v1alpha1/customPackages/*`)
          ?.pipe(map((event) => event.body as CustomPackageWebsocketMessage));
        try {
          await cacheDataLoaded;
          subscription = ws?.subscribe((res) =>
            updateCachedData((draft) => {
              const updatedPackage = draft.packages.find(
                (pkg) => pkg.name === res.name
              );
              if (updatedPackage) {
                updatedPackage.customPackageStatus = res.status;
              }
            })
          );
        } catch (err) {
          subscription = undefined;
          newrelic.noticeError(err as Error);
        }
        await cacheEntryRemoved;
        subscription?.unsubscribe();
      },
    }),
    generateQuotation: build.mutation<
      GenerateQuotationResponse,
      GenerateQuotationPayload
    >({
      query: ({ payload }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: '/v1alpha1:generateAndDownloadQuotationWithPricing',
        }),
        method: 'POST',
        body: payload,
      }),
    }),
    generateLink: build.mutation<
      GenerateLinkResponsePayload,
      GenerateLinkRequestPayload
    >({
      query: ({ payload }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: '/v1alpha1:generateLinkWithPricing',
        }),
        method: 'POST',
        body: payload,
      }),
    }),
    getSumInsuredRange: build.query<SumInsuredRangeResponse, number>({
      query: (carYear) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/${basePaths.car}/years/${carYear}:getSumInsuredRange`,
        }),
        method: 'GET',
      }),
      transformResponse: (response: any) => ({
        sumInsuredMax: parseInt(response.sumInsuredMax, 10) / 100,
        sumInsuredMin: parseInt(response.sumInsuredMin, 10) / 100,
      }),
    }),
    getSelectedPackage: build.query<
      GetSelectedPackageResponse,
      { leadId: string; enableDiscountPricing?: boolean }
    >({
      query: ({ leadId, enableDiscountPricing }) => {
        const params = new URLSearchParams();
        if (enableDiscountPricing) {
          params.set('includeCustomQuote', 'true');
        }

        return {
          url: buildUrl(baseUrls.goBff, {
            path: `/v1alpha1/leads/${leadId}:viewSelectedPackageWithPricing`,
          }),
          method: 'GET',
          params,
        };
      },
      providesTags: ['PACKAGE_SELECTION'],
    }),
    selectPackage: build.mutation<any, SelectPackageRequest>({
      query: ({ leadId, payload }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/leads/${leadId}:selectPackageWithPricing`,
        }),
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PACKAGE_SELECTION'],
    }),
    insurerSumInsuredRange: build.query<InsurerSumInsuredRangeResponse, number>(
      {
        query: (carYear) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `/${basePaths.car}/years/${carYear}:listSumInsuredRange`,
          }),
        }),
      }
    ),
  }),
});

export const {
  useGetPackagesQuery,
  useLazyGetPackagesQuery,
  useGenerateQuotationMutation,
  useGenerateLinkMutation,
  useGetSumInsuredRangeQuery,
  useGetSelectedPackageQuery,
  useSelectPackageMutation,
  useInsurerSumInsuredRangeQuery,
} = packageListingSlice;
