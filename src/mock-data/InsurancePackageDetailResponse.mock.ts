import { InsurancePackageDetailResponse } from 'data/slices/genericPackageSlice';
import {
  mockInsurancePackage,
  mockComplexInsurancePackage,
} from './InsurancePackage.mock';
import {
  mockInsuranceInsurer,
  mockComplexInsuranceInsurer,
} from './InsuranceInsurer.mock';

export const mockInsurancePackageDetailResponse: InsurancePackageDetailResponse =
  {
    package: mockInsurancePackage,
    insurer: mockInsuranceInsurer,
    sumInsured: '1000000',
    sumInsuredSource: 'sum_coverage_min',
    sumInsuredMin: '1000000',
    sumInsuredMax: '2000000',
    sumInsuredDefault: '1500000',
    couponDiscount: '0',
    invoicePrice: '1000000',
    grossVoluntaryPremium: '800000',
    grossMandatoryPremium: '200000',
    firstInstallment: '0',
    remainingInstallment: '0',
  };

export const mockComplexInsurancePackageDetailResponse: InsurancePackageDetailResponse =
  {
    package: mockComplexInsurancePackage,
    insurer: mockComplexInsuranceInsurer,
    sumInsured: '5000000',
    sumInsuredSource: 'sum_coverage_min',
    sumInsuredMin: '5000000',
    sumInsuredMax: '10000000',
    sumInsuredDefault: '7500000',
    couponDiscount: '10000',
    invoicePrice: '2500000',
    grossVoluntaryPremium: '2000000',
    grossMandatoryPremium: '500000',
    firstInstallment: '1250000',
    remainingInstallment: '1250000',
  };

// Helper function to create mock data with overrides
export const createMockInsurancePackageDetailResponse = (
  overrides: Partial<InsurancePackageDetailResponse> = {}
): InsurancePackageDetailResponse => ({
  ...mockInsurancePackageDetailResponse,
  ...overrides,
});
