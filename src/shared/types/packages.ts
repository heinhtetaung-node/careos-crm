import { InsuranceKind } from './insurers';

interface Discount {
  type: string;
  percentage: number;
  amount: string;
}

export interface PriceSummary {
  interestRate: number;
  interestAmount: string;
  processingFeeRate: number;
  processingFeeAmount: string;
  feeRate: number;
  feeAmount: string;
  discountRate: number;
  discountAmount: string;
  netDiscountRate: number;
  netDiscountAmount: string;
  packagePriceAfterDiscount: string;
  netPremiumAmount: string;
  initialAmount: string;
  subsequentAmount: string;
  discount?: Discount | null;
  shipmentFee?: string;
  feeAmountNoShip?: string;
  whtAmount?: string;
}

export interface InstallmentDetail {
  period: number;
  paymentAmount: string;
  principal: string;
  addOns: string;
  interest: string;
  processingFee: string;
  principalBalance: string;
  interestBalance: string;
  processingFeeBalance: string;
  totalBalance: string;
}

export interface CustomQuoteDetail {
  cardProvider: string;
  discountType: string;
  name: string;
  numberOfInstallments: number;
  paymentMethod: string;
  paymentOption: string;
  createTime: string;
  updateTime: string;
  packageResource: {
    packagePrice: {
      compulsoryPrice: string;
      voluntaryPrice: string;
      discount?: {
        type?: string;
        percentage?: number;
        amount?: string;
      };
    };
  };
  priceDetail: {
    priceSummary?: PriceSummary | null;
    installmentDetails?: InstallmentDetail[];
    resourceName: string;
  };
  approver: string;
  approverRemark?: string;
  discountSource: string;
  deliveryOption?: string;
}

export type CustomPackageApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPROVAL_NOT_REQUIRED';

export interface Package {
  deduct?: any;
  package?: any;
  bailBondCoverage: number;
  canBuy: boolean;
  carDiscountAmount: string;
  carDiscountPercentage: number;
  carInsuranceType: CarInsuranceType;
  carRepairType: CarRepairType;
  customQuoteDetails?: CustomQuoteDetail;
  customPackageStatus?: CustomPackageApprovalStatus;
  numberOfClaims?: number;
  couponDiscountAmount: number;
  createTime: string;
  deductibleAmount: number;
  displayName: string;
  expireTime: string;
  fireTheftCoverage: number;
  floodCoverage: number;
  grossMandatoryPremium: string;
  grossVoluntaryPremium: string;
  hasCctvDiscount: boolean;
  installmentApplied?: boolean;
  insuranceCategory: InsuranceKind;
  insuranceCompany: {
    displayName: string;
    displayNameTh: string;
    name: string;
    logo: string;
    order: number;
    rating?: number;
    shortnameEn: string;
    shortnameTh: string;
  };
  priceSummary?: PriceSummary | null;
  installmentDetails?: InstallmentDetail[];
  invoicePrice: string;
  isLowCost: boolean;
  liabilityPerAccidentCoverage: number;
  liabilityPerPersonCoverage: number;
  liabilityPropertyCoverage: number;
  medicalExpensesCoverage: number;
  name: string;
  noClaimBonusAmount?: number;
  claimValue?: number;
  originalPrice: number;
  packageSource: PackageSource;
  personalAccidentCoverage: number;
  product: ProductType;
  sumCoverage: number;
  sumCoverageMax: number;
  sumCoverageMin: number;
  sumInsuredDefault: number;
  sumInsuredMax: number;
  sumInsuredMin: number;
  sumInsuredSource: string;
  termsEn: string;
  termsTh: string;
  customPackageResourceName?: string;
  carDetails?: any;
  insurerDetails?: {
    careOsInsurerId: string;
    code: string;
    localisedName: {
      id: number;
      nameTh: string;
      nameEn: string;
    };
    name: string;
  };
}

export interface PriceDetail {
  // Packages resource name. Will be in the form `packages/{package}`, `mandatoryPackages/{package}`, or `renewal/{package}`
  resourceName: string;
  // Price summary.
  priceSummary: PriceSummary;
  // Installment detail for each period.
  installmentDetails: InstallmentDetail[];
}

export type CarInsuranceType =
  | 'Type 1'
  | 'Type 2'
  | 'Type 3'
  | 'Type 2+'
  | 'Type 3+';

export type HealthInsuranceType =
  | 'OPD Outpatient'
  | 'Maternity'
  | 'Health Check Up'
  | 'Dental Treatment'
  | 'Eyes Treatment'
  | 'Covid-19'
  | 'Emergency Accident'
  | 'Daily Compensation'
  | 'BDMS'
  | 'Cancer'
  | 'Critical illness'
  | 'PA Loss Of Life';

export type CarRepairType = 'Dealer' | 'Garage' | 'both';

export type PackageSource =
  | 'import'
  | 'manual'
  | 'renewal_manual_quote'
  | 'custom'
  | 'default';

export type ProductType = 'products/car-insurance';
