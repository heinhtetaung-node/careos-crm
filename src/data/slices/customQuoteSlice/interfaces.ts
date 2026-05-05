import {
  ICreatePackage,
  IManualPackage,
} from 'shared/interfaces/common/lead/package';

export interface CreateRenewalPackagePayload {
  leadId: string;
  packageData: {
    renewalPackage: {
      insurer: string;
      lastPolicyNumber: string;
      lastPolicyExpirationDate: string;
      oicCode: string;
      numberOfClaims: number;
      claimValue: number;
      noClaimBonus: number;
      carInsuranceType: string;
      carRepairType: string;
      numberOfFixedDriver?: number;
      firstDriverName?: string;
      firstDriverDob?: string;
      secondDriverName?: string;
      secondDriverDob?: string;
      liabilityPropertyCoverage: number;
      liabilityPerPersonCoverage: number;
      liabilityPerAccidentCoverage: number;
      sumCoverage: number;
      floodCoverage: number;
      fireTheftCoverage: number;
      personalAccidentCoverage: number;
      personalAccidentCoverageNo: number;
      medicalExpensesCoverage: number;
      medicalExpensesCoverageNo: number;
      bailBondCoverage: number;
      deductibleAmount: number;
      stamp?: number;
      vat?: number;
      grossPremium: number;
      groupDiscount?: number;
      otherDiscount?: number;
    };
  };
}

export interface CreateCustomPackageNewPayload {
  leadId: string;
  packageData: {
    package: IManualPackage;
  };
}

export interface CustomPackageResponsePayload {
  displayName: string;
  priceResourceName: string;
}
export interface ManualPackageResponsePayload {
  name?: string;
  displayName?: string;
  price: string;
  insurer: string;
  carInsuranceType: string;
  isFixedPremium?: boolean;
  deductibleAmount?: string;
  sumCoverageMin: string;
  sumCoverageMax: string;
  bailBondCoverage: string;
  fireTheftCoverage: string;
  floodCoverage: string;
  medicalExpensesCoverage: string;
  medicalExpensesCoverageNo: number;
  personalAccidentCoverage: string;
  personalAccidentCoverageNo: number;
  liabilityPropertyCoverage: string;
  liabilityPerPersonCoverage: string;
  liabilityPerAccidentCoverage: string;
  carRepairType: string;
  carAgeMin: number;
  carAgeMax: number;
  modifiedCarAccepted: boolean;
  oicCode: string;
  termsEn?: string;
  termsTh?: string;
  expireTime?: string | null;
  status?: string;
  filename?: string;
  createTime?: string | null;
  updateTime?: string | null;
  broker?: string;
  source?: string;
  code?: number;
  insurerPackageCode?: string;
  isEcoCar?: boolean;
  yearlyMileage?: number;
  antiTheftDiscount?: string;
  yearsOwned?: number;
  numberVehiclesHousehold?: number;
  carRegistrationCategory?: string;
  drivingPurpose?: string;
  parkingLocation?: string;
  maritalStatus?: string;
  occupation?: string;
  drivingExperience?: number;
  reuseManualPackage?: boolean;
  hasCctvDiscount?: boolean;
  startTime?: string | null;
  isLowCost?: boolean;
  provinces?: [string];
  gender?: string;
  carUsingPurpose?: string;
  noClaimBonus?: string;
  excessType?: string;
  minYearsOfHoldingDriverLicense?: number;
  maxYearsOfHoldingDriverLicense?: number;
  minNumberOfClaimsInYear?: number;
  maxNumberOfClaimsInYear?: number;
  maxAge?: number;
  minAge?: number;
  minMileage?: number;
  maxMileage?: number;
  carSubmodels?: [string];
  insuranceCategory?: string;
  packageType?: string;
  noClaimBonusAmount?: string;
  claimValue?: string;
  numberOfClaims?: number;
}
