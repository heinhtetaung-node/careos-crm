import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';
import type {
  AggregationRequest,
  AggregationResponse,
  SearchRequest,
  SearchResponse,
  PremiumDetailResponse,
} from './insurancePackageApi.types';

const AGGREGATION_PATH = '/api/insurance-package/v1/aggregation';
const SEARCH_PATH = '/api/insurance-package/v1/search';
const PREMIUM_DETAIL_PATH = (premiumId: string) => {
  const normalizedPremiumId = premiumId.startsWith('premiums/')
    ? premiumId.slice('premiums/'.length)
    : premiumId;

  return `/api/insurance-package/v1/products/motor-insurance/premiums/${encodeURIComponent(normalizedPremiumId)}`;
};
/**
 * Redux Toolkit Query API for insurance-package aggregation, search, and premium detail.
 * Lives in the performanceEnhanced model layer.
 */
export const insurancePackageApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getInsurancePackageAggregation: build.mutation<
      AggregationResponse,
      AggregationRequest
    >({
      query: (body) => ({
        url: buildUrl(baseUrls.salesFlow, { path: AGGREGATION_PATH }),
        method: 'POST',
        body,
      }),
    }),

    getInsurancePackageSearch: build.mutation<SearchResponse, SearchRequest>({
      query: (body) => ({
        url: buildUrl(baseUrls.salesFlow, { path: SEARCH_PATH }),
        method: 'POST',
        body,
      }),
    }),

    getInsurancePremiumDetail: build.query<
      PremiumDetailResponse,
      { premiumId: string }
    >({
      query: ({ premiumId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: PREMIUM_DETAIL_PATH(premiumId),
        }),
      }),
    }),
  }),
});

export const {
  useGetInsurancePackageAggregationMutation,
  useGetInsurancePackageSearchMutation,
  useGetInsurancePremiumDetailQuery,
  useLazyGetInsurancePremiumDetailQuery,
} = insurancePackageApi;

export type {
  AggregationRequest,
  AggregationResponse,
  AggregationCriteria,
  AggregationCriteriaInput,
  AggregationInsurerItem,
  SearchRequest,
  SearchResponse,
  SearchCriteria,
  SearchPremiumItem,
  PremiumDetailResponse,
  PremiumDetailProduct,
} from './insurancePackageApi.types';

export {
  getAggregationMetricValue,
  getAggregationRanges,
} from './insurancePackageApi.types';
export {
  buildAggregationRequest,
  buildSearchRequest,
} from './insurancePackageApi.helpers';
