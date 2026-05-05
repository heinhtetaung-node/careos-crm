import { apiSlice, basePaths, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  PerformanceStat,
  PerformanceStatFilters,
  PerformanceStatsResponse,
} from './types';

export type { PerformanceStat };

const performanceStatisticSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPerformanceStats: build.query<
      PerformanceStatsResponse,
      PerformanceStatFilters | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};

        if (params?.filter) {
          queryParams.filter = params.filter;
        }

        if (params?.poll !== undefined) {
          queryParams.poll = String(params.poll);
        }

        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: `${basePaths.dashboard}/dashboard`,
          }),
          method: 'GET',
          params: queryParams,
        };
      },
    }),
  }),
});

export const { useGetPerformanceStatsQuery, useLazyGetPerformanceStatsQuery } =
  performanceStatisticSlice;
