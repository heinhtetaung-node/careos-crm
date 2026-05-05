export interface CarInfo {
  year?: string;
  brand?: string;
  carModel?: string;
  licensePlate?: string;
  [key: string]: unknown;
}
export interface HealthInfo {
  planName?: string;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
  orderCancellationStatus?: boolean;
  orderCancellationReason?: string;
  orderCancellationDate?: string;
  [key: string]: unknown;
}

export interface PackageInfo {
  insuranceType?: string;
  expirationDate?: string;
  premiumAmount?: string;
  sumInsured?: string;
  [key: string]: unknown;
}

export interface InsurerInfo {
  insurerName?: string;
  shortNameEn?: string;
  shortNameTh?: string;
  phone?: string;
  website?: string;
  [key: string]: unknown;
}

export interface PaymentInfo {
  numberOfInstallments?: number;
  paidInstallments?: number;
  paymentOption?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentAmount?: number;
  paymentStatus?: string;
  [key: string]: unknown;
}

export interface LeadInfo {
  lead?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
  source?: {
    channel?: string;
    campaign?: string;
    source?: string;
  };
  [key: string]: unknown;
}

export interface PolicyData {
  orderItemHumanId: string;
  matterOfConnection?: string;
  carInfo?: CarInfo;
  healthInfo?: HealthInfo;
  packageInfo?: PackageInfo;
  insurerInfo?: InsurerInfo;
  paymentInfo?: PaymentInfo;
  leadInfo?: LeadInfo;
}

export interface InsuranceProduct {
  product: string;
  productLabel: string;
  policies: PolicyData[];
}

export interface AccountCurrentProductData {
  insuranceProducts: InsuranceProduct[];
}
