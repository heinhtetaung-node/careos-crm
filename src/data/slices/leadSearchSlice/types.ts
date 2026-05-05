import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { Lead, PaymentMethod, PaymentOption } from 'shared/types/lead';
import { PriceDetail } from 'shared/types/packages';

import { Order, Package } from '../orderPolicySlice/interface';
import {
  ChargeResponse,
  SuccessfulTransactionApiResponse,
} from '../transactionSlice/interface';
import { CommonAPIResponse } from '../types';

export enum ContractStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  SIGNED = 'SIGNED',
}

export type ContractDetail = {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime?: string;
  createBy: string;
  status: ContractStatus;
  leadResource: string;
  productType: string;
  customerIdCard: string;
  packageResource: string;
  coverageStartTime: string;
  coverageEndTime: string;
  documentIdCard: string;
  documentCopyIdCard?: string;
  documentSignature: string;
  remark: string;
  decidedBy: string;
  reviewBy: string;
  consentMetadata: string;
  firstInstallmentDate: string;
  installmentDueDates: string[];
};

export type CustomPackage = {
  name: string;
  package: string;
  lead: string;
  priceResourceName: string;
  status: string;
  createTime: string;
  updateTime: string;
  deleteTime: string;
  createBy: string;
  deleteBy: string;
  deliveryOption: string;
};

export type ContractPrice = {
  name: string;
  priceDetail: PriceDetail;
  paymentOption: PaymentOption;
  paymentMethod: PaymentMethod;
  numberOfInstallments: number;
  cardProvider: string;
  createTime: string;
  updateTime: string;
  discountType: string;
  packageResource: {
    healthPackage?: any;
    carPackage: {
      package: string;
      packagePrice: Package;
      insurer: string;
      insuranceType: string;
    };
  };
};

export type Person = {
  name: string;
  firstName: string;
  lastName: string;
};

export interface SearchContractData {
  contract: ContractDetail;
  customPackage: CustomPackage;
  price: ContractPrice;
  lead: Lead;
  assigned: Person;
  reviewer: Person;
  assignedTeam: {
    displayName: string;
  };
  attributes: {
    lead: {
      carLicensePlate: string;
      customerEmail: string;
      customerFirstname: string;
      customerLastname: string;
      customerPhone: string;
    };
    customerEmail: string;
    customerFullName: string;
    customerPhone: string;
    licensePlate: string;
    leadHumanId: string;
    policyHolderFullName: string;
  };
}

export interface SearchContractDataResponse {
  data: {
    contracts: SearchContractData[];
    total: number;
  };
  error?: FetchBaseQueryError;
}

interface CarepayChargeResponse {
  charges: ChargeResponse[];
  transaction: SuccessfulTransactionApiResponse['transaction'];
  lead: Lead;
  order: Order;
  followup: {
    name?: string;
    version: string;
    chargeId: string;
    transactionId: string;
    installmentNumber: number;
    dueDate: string;
    sendSms: boolean;
    slipIdResource: string;
    installmentDetail?: {
      paymentAmount: string;
    };
  } & CommonAPIResponse;
  team: string;
  price: {
    priceDetail: PriceDetail;
  };
}
export interface SearchCarepayChargesResponse {
  data: {
    followups: CarepayChargeResponse[];
    total: number;
  };
  error?: FetchBaseQueryError;
}
export interface SearchCarePayTransactionResponse {
  transaction: SuccessfulTransactionApiResponse['transaction'];
  followups: any; // ADD types later.
  lead: Lead;
  latestCharge: SuccessfulTransactionApiResponse['latestCharge'];
  attributes: {
    lead: any;
  };
  order?: Order;
  transactionSnapshot?: {
    paymentMethod: string;
  };
}
