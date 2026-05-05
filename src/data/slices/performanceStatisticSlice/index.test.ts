// @ts-nocheck
import * as apiSliceModule from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';
import {
  useGetPerformanceStatsQuery,
  useLazyGetPerformanceStatsQuery,
} from './index';

jest.mock(
  'data/slices/apiSlice',
  () => {
    let mockEndpoints: any;

    const injectEndpointsMock = jest.fn((config) => {
      // Simulate RTK Query's build.query by returning the config object itself
      mockEndpoints = config.endpoints({
        query: (arg: any) => arg,
      });

      return {
        useGetPerformanceStatsQuery: jest.fn(),
        useLazyGetPerformanceStatsQuery: jest.fn(),
        endpoints: mockEndpoints,
      };
    });

    return {
      baseUrls: { salesFlow: 'https://example.com/' },
      basePaths: { dashboard: 'api/dashboard/v1' },
      apiSlice: { injectEndpoints: injectEndpointsMock },
      __mock: {
        getEndpoints: () => mockEndpoints,
        injectEndpointsMock,
      },
    };
  },
  { virtual: true }
);

jest.mock(
  'utils/url',
  () => ({
    buildUrl: jest.fn(
      (base: string, opts: { path: string }) => `${base}${opts.path}`
    ),
  }),
  { virtual: true }
);

describe('performanceStatisticSlice', () => {
  it('injects getPerformanceStats endpoint and exports hooks', () => {
    const { __mock } = apiSliceModule;
    const endpoints = __mock.getEndpoints();

    // Endpoint should be registered
    expect(endpoints).toHaveProperty('getPerformanceStats');
    expect(typeof endpoints.getPerformanceStats.query).toBe('function');

    // Hooks should be exported from the slice
    expect(typeof useGetPerformanceStatsQuery).toBe('function');
    expect(typeof useLazyGetPerformanceStatsQuery).toBe('function');
  });

  it('builds query without params', () => {
    const { __mock } = apiSliceModule;
    const endpoints = __mock.getEndpoints();
    const cfg = endpoints.getPerformanceStats;

    const result = cfg.query(undefined);

    expect(buildUrl).toHaveBeenCalledWith('https://example.com/', {
      path: 'api/dashboard/v1/dashboard',
    });
    expect(result).toEqual({
      url: 'https://example.com/api/dashboard/v1/dashboard',
      method: 'GET',
      params: {},
    });
  });

  it('includes filter param when provided', () => {
    const { __mock } = apiSliceModule;
    const endpoints = __mock.getEndpoints();
    const cfg = endpoints.getPerformanceStats;

    const result = cfg.query({ filter: 'presence.status="STATUS_CALL"' });

    expect(result.params).toEqual({
      filter: 'presence.status="STATUS_CALL"',
    });
  });

  it('includes poll param when provided, even without filter', () => {
    const { __mock } = apiSliceModule;
    const endpoints = __mock.getEndpoints();
    const cfg = endpoints.getPerformanceStats;

    const result = cfg.query({ poll: 3 });

    expect(result.params).toEqual({
      poll: '3',
    });
  });

  it('includes both filter and poll when both are provided', () => {
    const { __mock } = apiSliceModule;
    const endpoints = __mock.getEndpoints();
    const cfg = endpoints.getPerformanceStats;

    const result = cfg.query({
      filter: 'team="teams/abc"',
      poll: 0,
    });

    // poll is included even when 0, because slice checks for !== undefined
    expect(result.params).toEqual({
      filter: 'team="teams/abc"',
      poll: '0',
    });
  });
});
