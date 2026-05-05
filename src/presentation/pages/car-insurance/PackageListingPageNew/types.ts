export interface InsurancePackage {
  id: string;
  uploadPackageName: string;
  packageName: string;
  insuranceType: string;
  insuranceCategory: string;
  repairType: string;
  subModel: string;
  carCoverage: number;
  deductible: number;
  price: number;
  insuranceCompany: string;
  insuranceCompanyData: {
    name: string;
    displayName: string;
    logo: string;
  };
  includeDashCamDiscount: boolean;
  oicCode: string;
  startDate: Date;
  expiryDate: Date;
  mandatoryPricePerYear: number;
  premium: number;
  coverageDetails: {
    maximumAnnualCoverage: number;
    ownCarDamage: number;
    personalInjury: number;
    medicalExpense: number;
    bailBond: number;
    propertyDamage: number;
    deathPerPerson: number;
    maximumDeath: number;
    floodCoverage: number;
    theftAndFireCoverage: number;
  };
  termsAndConditions: string;
  applicableProvinces: string | string[];
}

export interface PackageGroup {
  id?: string;
  name: string;
  insuranceCompany: {
    name: string;
    displayName: string;
    logo: string;
  };
  carCoverageRange: { min: number; max: number; highlighted: number };
  priceRange: { min: number; max: number; highlighted: number };
  packages: InsurancePackage[];
  total: number;
}

/** Response shape for generic packages listing (from useGenericPackagesWithInsurers / getGenericPackages). */
export interface GenericPackagesResponse {
  packages: PackageGroup[];
  total: number;
  nextToken?: string;
  success?: boolean;
}

export interface CustomPackage {
  insurer: string;
  packageName: string;
  insuranceType: string;
  insuranceCategory: string;
  repairType: string;
  carCoverage: number;
  deductible: number;
  price: number;
  paymentPlan: string;
  shippingFee: number;
  discount: number;
  processingFee: number;
  invoiceAmount: number;
}
