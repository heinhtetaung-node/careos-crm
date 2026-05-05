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
export interface Package {
  bailBondCoverage: string;
  canBuy: boolean;
  carDiscountAmount: string;
  carDiscountPercentage: number;
  carInsuranceType: CarInsuranceType;
  carRepairType: CarRepairType;
  couponDiscountAmount: string;
  createTime: string;
  deductibleAmount: string;
  displayName: string;
  expireTime: string;
  fireTheftCoverage: string;
  floodCoverage: string;
  grossMandatoryPremium: string;
  grossVoluntaryPremium: string;
  hasCctvDiscount: boolean;
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
    /** API may send snake_case alongside camelCase */
    shortname_en?: string;
    shortname_th?: string;
  };
  invoicePrice: string;
  isLowCost: boolean;
  liabilityPerAccidentCoverage: string;
  liabilityPerPersonCoverage: string;
  liabilityPropertyCoverage: string;
  medicalExpensesCoverage: string;
  name: string;
  originalPrice: string;
  packageSource: PackageSource;
  personalAccidentCoverage: string;
  product: ProductType;
  sumCoverage: string;
  sumCoverageMax: string;
  sumCoverageMin: string;
  sumInsuredDefault: string;
  sumInsuredMax: string;
  sumInsuredMin: string;
  sumInsuredSource: string;
  termsEn: string;
  termsTh: string;
  priceSummary?: {
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
  } | null;
  installmentDetails?: {
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
  }[];
  customQuoteDetails?: CustomQuoteDetail;
}

export type CarInsuranceType =
  | 'Type 1'
  | 'Type 2'
  | 'Type 3'
  | 'Type 2+'
  | 'Type 3+';

type CarRepairType = 'Dealer' | 'Garage' | 'both';

type PackageSource = 'import' | 'manual' | 'renewal_manual_quote' | 'custom';

type ProductType = 'products/car-insurance';

type InsuranceKind = 'both' | 'mandatory' | 'voluntary' | 'compulsory';

export interface Range {
  min: bigint;
  max: bigint;
}

type SortByType = 'brand' | 'price' | 'sumInsured' | 'default' | any;
type DeductibleType = 'all_packages' | 'only_deductible' | 'no_deductible';

export interface FilterInterface {
  sortBy?: SortByType;
  orderBy?: 'asc' | 'desc';
  insuranceCategory: InsuranceKind;
  insuranceType: Record<CarInsuranceType, boolean>;
  repairType: CarRepairType;
  deductible: DeductibleType;
  price?: Range;
  sumInsured?: Range;
  insurer: Record<string, boolean>;
  installment?: number;
  paymentOption?: string;
  modification?: boolean;
}
