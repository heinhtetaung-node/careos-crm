import { CarDetails } from '@alphafounders/ui';

import {
  CustomPackageApprovalStatus,
  Package,
  ProductType,
} from 'shared/types/packages';

// Common ones
interface FilterProps {
  package: string;
  insuranceKind: string;
  sumInsuredMax?: number | string;
  sumInsuredMin?: number | string;
  paymentOption?: string;
  paymentMethod?: string;
  installmentPlan?: number;
}

interface CarInsurancePayloadProps {
  filters: FilterProps[];
}

export interface GetPackagesRequest {
  leadId: string;
  productType: ProductType;
  sumInsuredMin?: number | string;
  sumInsuredMax?: number | string;
  paymentOption?: string;
  installment?: number;
  includeCustomQuote?: boolean;
  healthPackageFilter?: any;
  year?: number;
  model?: number;
  subModel?: string | number;
  carSubModelYear?: number;
  brand?: number;
  province?: string | number;
  drivingPurpose?: 'personal' | 'commercial';
  hasCarDashcam?: boolean;
  doors?: number;
  engineSize?: number;
  newSearch?: boolean;
  insuranceKind?: string;
}
export interface GetPackagesResponse {
  packages: Package[];
  carDisplayName: string;
  carDetails: CarDetails;
}

export interface GenerateQuotationPayload {
  payload: {
    lead: string;
    product: ProductType;
    carInsuranceQuotationFilter?: CarInsurancePayloadProps;
    packageFilter?: {
      sumInsuredMin?: number | string;
      sumInsuredMax?: number | string;
      insuranceKind: string;
      packages?: string[];
      paymentOption?: string;
      paymentMethod?: string;
      installment?: number;
    };
    includeCustomQuote?: boolean;
    includeShipmentFee?: boolean;
  };
}

export interface GenerateQuotationResponse {
  document: string;
}

export interface GenerateLinkRequestPayload {
  payload: {
    lead: string;
    action: 'details' | 'comparison';
    product: 'products/car-insurance';
    carInsurancePackageFilter?: CarInsurancePayloadProps;
    packageFilter?: {
      packages?: string[];
      insuranceKind: string;
      sumInsuredMax?: number | string;
      sumInsuredMin?: number | string;
      paymentOption?: string;
      paymentMethod?: string;
      installment?: number;
    };
    includeCustomQuote?: boolean;
  };
}
export interface GenerateLinkResponsePayload {
  url: string;
}

export interface SumInsuredRangeResponse {
  sumInsuredMin: number;
  sumInsuredMax: number;
}

export type SelectedPackageDetail = {
  carDisplayName?: string;
  sumInsuredMax?: number;
  sumInsuredMin?: number;
  package?: Package;
  carDetails?: CarDetails;
  installment?: string | null;
  paymentOption?: string | null;
  paymentMethod?: string | null;
  customPackageResourceName?: any;
  customQuoteDetails?: any | undefined;
};

export interface GetSelectedPackageResponse {
  carPackage?: SelectedPackageDetail;
  healthPackage?: SelectedPackageDetail;
  carPackageWithPricing?: SelectedPackageDetail;
}
export interface SelectPackageRequest {
  leadId: string;
  payload: {
    package: string;
    insuranceKind: string;
    sumInsuredMin?: number | string;
    sumInsuredMax?: number | string;
    paymentOption?: string;
    paymentMethod?: string;
    price_in_satang?: boolean;
    installmentPlan?: number;
    includeCustomQuote?: boolean;
  };
}

export interface InsurerSumInsuredRangeResponse {
  range: {
    insurer: string;
    sumInsuredMin: string;
    sumInsuredMax: string;
  }[];
}

export interface CustomPackageWebsocketMessage {
  deliveryOption: string;
  lead: string;
  name: string;
  package: string;
  priceResourceName: string;
  status: CustomPackageApprovalStatus;
}
