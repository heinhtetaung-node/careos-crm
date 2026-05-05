import { PaymentMethod, PaymentOption } from 'shared/types/lead';
import {
  InstallmentDetail,
  PriceDetail,
  PriceSummary,
} from 'shared/types/packages';

import { CommonAPIResponse } from '../types';

interface Money {
  amount: string;
  currencyCode: string;
}
export interface ChargeResponse extends CommonAPIResponse {
  authorizeUri: string;
  errorCode: string;
  errorMessage: string;
  httpStatusCode: number;
  installmentNumber: number;
  money: Money;
  name: string;
  paymentMethod: string;
  returnUri: string;
  serviceProvider: string;
  sourceUri: string;
  status: string;
  thirdPartyId: string;
  token: string;
  dueDate: string;
  paymentDate?: string;
  slipIdResource?: string;
}
export interface SuccessfulTransactionApiResponse {
  charges: (ChargeResponse & CommonAPIResponse)[];
  order: any; // add the type later
  followups: Array<{
    followup: any;
  }>; // add the type later
  orderCreatedBy: any; // add the type later
  transaction: {
    createTime: string;
    gatewayReference: string;
    installments: number;
    lead: string;
    leadHumanId: string;
    money: Money;
    name: string;
    order: string;
    paymentOption: string;
    statusCode: string;
    updateTime: string;
    quote: string;
  } & CommonAPIResponse;
  latestCharge: {
    name: string;
    createTime: string;
    updateTime: string;
    money: Money;
    serviceProvider: string;
    paymentMethod: string;
    returnUri: string;
    authorizeUri: string;
    token: string;
    status: string;
    thirdPartyId: string;
    sourceUri: string;
    errorCode: string;
    httpStatusCode: number;
    errorMessage: string;
    installmentNumber: number;
    cardToken: string;
    dueDate: any;
    slipIdResource: string;
    sendSms: boolean;
    paymentDate: string;
  };
}

export interface SuccessfulTransaction
  extends SuccessfulTransactionApiResponse {
  paidAmount: string;
  paidDate: string;
  totalTransactionAmount: string;
}

export interface TransactionFee {
  name: string;
  paymentOption: keyof typeof PaymentOption;
  paymentMethod: keyof typeof PaymentMethod;
  priceSummary: PriceSummary;
  installmentDetails: InstallmentDetail;
  isCurrent: boolean;
  createTime: string;
  updateTime: string;
}
export interface PriceResponse {
  packageResource: {
    carPackage: {
      packagePrice: {
        voluntaryPrice: string;
      };
    };
  };
  priceDetail: {
    priceSummary: PriceSummary;
  };
  voluntaryPrice: number;
  invoicePrice: number;
}

export interface ChargeDataResponse {
  charges: ChargeResponse[];
}

export interface ChargeTransformResponse {
  paymentProviderId: string;
  paymentMethodText: string;
  paymentLinkStatus: string;
  amount: string;
  omiseDate: string;
  chargeId: string;
  createdOn: string;
  updatedOn: string;
  paymentStatus: string;
  installmentPlan: number;
  slipIdResource: string;
  paymentDate: string;
  money: { amount: string };
  createTime: string;
  updateTime: string;
  paymentMethod: string;
}

export interface PackagePriceResponse {
  price: {
    priceDetail: PriceDetail;
  };
}

export interface UpdateFollowupType {
  due_date: string;
}

export interface RefundPayload {
  parent: string;
  refund: {
    bank: string;
    paymentMethod: string;
    document: string;
    refund_date: string;
    account_number: number;
  };
}
