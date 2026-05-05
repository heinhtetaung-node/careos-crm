import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import PresentationUserModel from 'presentation/models/customer/user';
import { ICreateTeam } from 'shared/interfaces/common/admin/team';
import { Lead } from 'shared/types/lead';

import { CommonAPIResponse } from '../types';

export interface Voucher extends CommonAPIResponse {
  name: string;
  startTime: string;
  endTime: string;
  price: number;
  percentDiscount: number;
  voucherType: string;
  code: string;
  quantity: number;
  active: boolean;
  usageCount: number;
  humanName: string;
  message?: string;
}
export interface VoucherResponse {
  vouchers: Voucher[];
  nextPageToken: string;
}
export interface VoucherPayload {
  body: {
    startTime: string;
    endTime: string;
    price?: number | null;
    percentDiscount?: number | null;
    voucherType: string;
    code: string;
    quantity: number | null;
    active: boolean;
    humanName: string;
  };
}
export interface CampaignPayload {
  body: {
    name?: string;
    product?: string;
    startDate: string;
    endDate: string;
    discountPercentage: string;
    campaignCode: string;
    approver: string;
    description: string;
  };
}

export interface Campaign extends CommonAPIResponse {
  product: string;
  campaignCode: string;
  discountPercentage: number;
  approver: string;
  description: string;
  name: string;
  startDate: string;
  endDate: string;
}
export interface CampaignResponse {
  campaigns: Campaign[];
  nextPageToken: string;
}
export interface TransformedResponse {
  imports: Voucher[] | CampaignResponse[] | DiscountTransformedResponse[];
  nextPageToken?: string;
}
export interface UpdateVoucherStatusPayload {
  code: string;
  action: 'revert' | 'apply';
}

export interface DiscountTransformedResponse {
  name: string;
  requestTime: string;
  leadId: string;
  discountType: string;
  agentName: string;
  insurer: string;
  insuranceType: string;
  leadType: string;
  discount: string;
  requestDiscount: string;
  maxDiscount: number;
  description: string;
  configId: string;
  approver: string;
  approvalTime: string;
  status: string;
  approvalReason: string;
  index: number;
  leadName: string;
  priceBeforeDiscount: string;
  priceAfterDiscount: string;
  category: string;
}

export interface Request extends CommonAPIResponse {
  name: string;
  status: string;
  decideBy: string;
  amount?: number;
  percentage?: number;
  maxPercentage: number;
  source: string;
  approver: string;
  remark: string;
  code?: number;
  message?: string;
  details?: Record<string, string>[];
  type?: string;
  approverRemark: string;
}

export interface DiscountsRequest {
  request: Request;
  lead: Lead;
  team: ICreateTeam & CommonAPIResponse;
  user: PresentationUserModel & CommonAPIResponse;
  discountType: string;
  approver: PresentationUserModel & CommonAPIResponse;
}

export interface DiscountsRequestResponse {
  requests: DiscountsRequest[];
  total: number;
}

export enum ApprovalStatusTypes {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface DiscountApprovalPayload {
  name: string;
  body: {
    status: ApprovalStatusTypes;
    approverRemark?: string;
  };
}

export interface DiscountRequestDocumentResponse {
  documents: Array<IUploadedDocument>;
  nextPageToken: string;
}
