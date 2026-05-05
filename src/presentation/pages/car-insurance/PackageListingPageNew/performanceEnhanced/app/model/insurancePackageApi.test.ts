import {
  insurancePackageApi,
  useGetInsurancePackageAggregationMutation,
  useGetInsurancePackageSearchMutation,
  useGetInsurancePremiumDetailQuery,
  useLazyGetInsurancePremiumDetailQuery,
} from './insurancePackageApi';

describe('insurancePackageApi', () => {
  describe('module exports', () => {
    it('exports insurancePackageApi with injected endpoints', () => {
      expect(insurancePackageApi.endpoints).toBeDefined();
      expect(
        insurancePackageApi.endpoints.getInsurancePackageAggregation
      ).toBeDefined();
      expect(
        insurancePackageApi.endpoints.getInsurancePackageSearch
      ).toBeDefined();
      expect(
        insurancePackageApi.endpoints.getInsurancePremiumDetail
      ).toBeDefined();
    });

    it('exports aggregation mutation hook', () => {
      expect(typeof useGetInsurancePackageAggregationMutation).toBe('function');
    });

    it('exports search mutation hook', () => {
      expect(typeof useGetInsurancePackageSearchMutation).toBe('function');
    });

    it('exports premium detail query hook', () => {
      expect(typeof useGetInsurancePremiumDetailQuery).toBe('function');
    });

    it('exports lazy premium detail query hook', () => {
      expect(typeof useLazyGetInsurancePremiumDetailQuery).toBe('function');
    });
  });
});
