import type {
  AggregationMetric,
  AggregationMetricLabel,
} from './insurancePackageApi.types';
import {
  getAggregationMetricValue,
  getAggregationRanges,
} from './insurancePackageApi.types';

describe('insurancePackageApi.types', () => {
  describe('getAggregationMetricValue', () => {
    it('returns undefined when metrics is empty', () => {
      expect(
        getAggregationMetricValue<string>([], 'price_min')
      ).toBeUndefined();
    });

    it('returns undefined when label is not found', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_min',
          money: { currencyCode: 'THB', units: '5000', nanos: 0 },
        },
      ];
      expect(
        getAggregationMetricValue<string>(metrics, 'price_max')
      ).toBeUndefined();
    });

    it('returns money.units for money metric (price_min)', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_min',
          money: { currencyCode: 'THB', units: '5000', nanos: 0 },
        },
      ];
      expect(getAggregationMetricValue<string>(metrics, 'price_min')).toBe(
        '5000'
      );
    });

    it('returns money.units for money metric (price_max)', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_max',
          money: { currencyCode: 'THB', units: '25000', nanos: 0 },
        },
      ];
      expect(getAggregationMetricValue<string>(metrics, 'price_max')).toBe(
        '25000'
      );
    });

    it('returns money.units for coverage_min and coverage_max', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'coverage_min',
          money: { currencyCode: 'THB', units: '100000', nanos: 0 },
        },
        {
          label: 'coverage_max',
          money: { currencyCode: 'THB', units: '500000', nanos: 0 },
        },
      ];
      expect(getAggregationMetricValue<string>(metrics, 'coverage_min')).toBe(
        '100000'
      );
      expect(getAggregationMetricValue<string>(metrics, 'coverage_max')).toBe(
        '500000'
      );
    });

    it('returns listValue for sub_models metric', () => {
      const subModels = ['sub-1', 'sub-2'];
      const metrics: AggregationMetric[] = [
        { label: 'sub_models', listValue: subModels },
      ];
      expect(
        getAggregationMetricValue<string[]>(metrics, 'sub_models')
      ).toEqual(subModels);
    });

    it('returns undefined for metric with label but no money or listValue', () => {
      const metrics = [
        { label: 'price_min' as AggregationMetricLabel },
      ] as AggregationMetric[];
      expect(
        getAggregationMetricValue<string>(metrics, 'price_min')
      ).toBeUndefined();
    });
  });

  describe('getAggregationRanges', () => {
    it('returns all undefined numbers and empty subModels when metrics is empty', () => {
      const result = getAggregationRanges([]);
      expect(result).toEqual({
        priceMin: undefined,
        priceMax: undefined,
        coverageMin: undefined,
        coverageMax: undefined,
        subModels: [],
      });
    });

    it('parses price_min and price_max as numbers', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_min',
          money: { currencyCode: 'THB', units: '5000', nanos: 0 },
        },
        {
          label: 'price_max',
          money: { currencyCode: 'THB', units: '25000', nanos: 0 },
        },
      ];
      const result = getAggregationRanges(metrics);
      expect(result.priceMin).toBe(5000);
      expect(result.priceMax).toBe(25000);
      expect(result.coverageMin).toBeUndefined();
      expect(result.coverageMax).toBeUndefined();
      expect(result.subModels).toEqual([]);
    });

    it('parses coverage_min and coverage_max as numbers', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'coverage_min',
          money: { currencyCode: 'THB', units: '100000', nanos: 0 },
        },
        {
          label: 'coverage_max',
          money: { currencyCode: 'THB', units: '500000', nanos: 0 },
        },
      ];
      const result = getAggregationRanges(metrics);
      expect(result.priceMin).toBeUndefined();
      expect(result.priceMax).toBeUndefined();
      expect(result.coverageMin).toBe(100000);
      expect(result.coverageMax).toBe(500000);
      expect(result.subModels).toEqual([]);
    });

    it('returns subModels array when sub_models metric present', () => {
      const subModels = ['subA', 'subB'];
      const metrics: AggregationMetric[] = [
        { label: 'sub_models', listValue: subModels },
      ];
      const result = getAggregationRanges(metrics);
      expect(result.subModels).toEqual(subModels);
    });

    it('returns full ranges when all metrics present', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_min',
          money: { currencyCode: 'THB', units: '3000', nanos: 0 },
        },
        {
          label: 'price_max',
          money: { currencyCode: 'THB', units: '20000', nanos: 0 },
        },
        {
          label: 'coverage_min',
          money: { currencyCode: 'THB', units: '50000', nanos: 0 },
        },
        {
          label: 'coverage_max',
          money: { currencyCode: 'THB', units: '300000', nanos: 0 },
        },
        { label: 'sub_models', listValue: ['s1', 's2'] },
      ];
      const result = getAggregationRanges(metrics);
      expect(result).toEqual({
        priceMin: 3000,
        priceMax: 20000,
        coverageMin: 50000,
        coverageMax: 300000,
        subModels: ['s1', 's2'],
      });
    });

    it('returns undefined for invalid or empty string units', () => {
      const metrics: AggregationMetric[] = [
        {
          label: 'price_min',
          money: { currencyCode: 'THB', units: '', nanos: 0 },
        },
      ];
      const result = getAggregationRanges(metrics);
      expect(result.priceMin).toBeUndefined();
    });
  });
});
