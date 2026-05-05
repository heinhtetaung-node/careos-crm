import { PaymentOptions } from 'shared/types/lead';

export interface Campaign {
  name: string;
  displayName: string;
  maxDiscountPercent: number;
}

export type GetCampaignResponse = Array<Campaign>;

export interface GetCampaignRequest {
  leadId: string;
  packageId: string;
  discountType: string;
}

export interface GetApproverResponse {
  displayName: string;
}

export interface ApproverQueryParams {
  product: string;
  maxDiscountPercent: number;
  source: string;
}

export interface GetApproverRequest {
  queryParams: ApproverQueryParams;
}

interface PricingOptionsQueryParam {
  'discount.percentage': number;
  'discount.amount': number;
  'discount.discountType': string;
  insuranceKind?: string;
  shipmentFee?: number;
}

export interface GetPricingPaymentOptionsRequest {
  leadId: string;
  packageId: string;
  queryParams: PricingOptionsQueryParam;
}

export interface GetPricingPaymentOptionsResponse {
  paymentOptions: PaymentOptions;
}

export interface CreatePackageRequest {
  resourceId: string;
  payload: {
    parent: string;
    discountType?: string;
    discountPercentage: number;
    discountSource?: string;
    remark?: string;
    paymentOption: string;
    paymentMethod: string;
    cardProvider?: string;
    numberOfInstallments: number;
    documents?: {
      name: string;
      label: string;
    }[];
    insuranceKind: string;
    deliveryOption?: string;
  };
}

export interface CreatePackageResponse {
  name: string;
}

export interface UpdatePackageRequest {
  packageId: string;
  payload: {
    name: string;
    discountType?: string;
    discountPercentage: number;
    discountSource?: string;
    remark?: string;
    paymentOption: string;
    paymentMethod: string;
    cardProvider?: string;
    numberOfInstallments: number;
    documents?: { name: string; label: string }[];
    insuranceKind?: string;
    lead: string;
    deliveryOption?: string;
  };
}

export interface GetVoucherRequest {
  packageId: string;
  lead: string;
  numberOfInstallments: number;
  discountPercentage: number;
}

export interface GetCustomPackageRequest {
  packageId: string;
}
