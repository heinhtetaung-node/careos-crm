import { InsuranceKind } from 'shared/types/insurers';
import {
  HealthInsuranceType,
  CarInsuranceType,
  CarRepairType,
} from 'shared/types/packages';

interface Range {
  min: number;
  max: number;
}

export type Deductible = 'all_packages' | 'only_deductible' | 'no_deductible';

export interface FilterInterface {
  ipdCoverage: Range;
  opdCoverage: Range;
  sortBy: 'brand' | 'price' | 'sumInsured' | 'default';
  coverageType: Record<HealthInsuranceType, boolean>;
  deductible: Deductible;
  price: Range;
  sumInsured: Range;
  insurer: Record<string, boolean>;
  premium: Range;
  features: Record<string, boolean>;
}

export interface CoverageTypeInterface {
  'OPD Outpatient': boolean;
  Maternity: boolean;
  'Health Check Up': boolean;
  'Dental Treatment': boolean;
  'Eyes Treatment': boolean;
  'Covid-19': boolean;
  'Emergency Accident': boolean;
  'Daily Compensation': boolean;
  BDMS: boolean;
  Cancer: boolean;
  'Critical illness': boolean;
  'PA Loss Of Life': boolean;
}

export const CoverageTypeValues = {
  'OPD Outpatient': false,
  Maternity: false,
  'Health Check Up': false,
  'Dental Treatment': false,
  'Eyes Treatment': false,
  'Covid-19': false,
  'Emergency Accident': false,
  'Daily Compensation': false,
  BDMS: false,
  Cancer: false,
  'Critical illness': false,
  'PA Loss Of Life': false,
};

export type InsurerSumInsuranceRange = {
  insurer: string;
  sumInsuredMin: string;
  sumInsuredMax: string;
}[];
