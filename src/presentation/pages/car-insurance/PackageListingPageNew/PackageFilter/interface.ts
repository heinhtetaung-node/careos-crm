import { InsuranceKind } from 'shared/types/insurers';
import { CarInsuranceType, CarRepairType } from 'shared/types/packages';

interface Range {
  min: number;
  max: number;
}

export type Deductible = 'all_packages' | 'only_deductible' | 'no_deductible';

export interface FilterInterface {
  orderBy: 'asc' | 'desc' | undefined;
  sortBy: 'brand' | 'price' | 'sumInsured' | 'default';
  insuranceCategory: InsuranceKind;
  insuranceType: Record<CarInsuranceType, boolean>;
  repairType: CarRepairType;
  deductible: Deductible;
  price: Range;
  sumInsured: Range;
  insurer: Record<string, boolean>;
  isDefaultSumInsured: boolean;
  brand: any;
  year: any;
  model: any;
  subModel: any;
  carSubModelYear?: number;
  dashCam: boolean;
  modification: boolean;
  drivingPurpose: 'personal' | 'commercial' | undefined;
  province: any;
  engineSize?: number;
  noOfDoors?: number;
}

export type InsurerSumInsuranceRange = {
  insurer: string;
  sumInsuredMin: string;
  sumInsuredMax: string;
}[];
