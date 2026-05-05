import { IPageToken } from 'data/gateway/api/helper/queryString.helper';
import PresentationUserModel from 'presentation/models/customer/user';
import { ICreateTeam } from 'shared/interfaces/common/admin/team';

import {
  Data,
  ItemElement,
  Order,
  PolicyHolder,
} from '../orderPolicySlice/interface';
import { CommonAPIResponse } from '../types';

interface CustomerData {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: null;
  createBy: string;
  humanId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

interface CustomerInfo {
  customer: CustomerData;
  phones: any[];
  emails: any[];
}

interface Car {
  brand: Brand;
  model: Model;
  subModel: SubModel;
  carYear: number;
}

interface Brand {
  name: string;
  displayName: string;
  order: number;
}

interface Model {
  name: string;
  displayName: string;
  order: number;
  isCurated: boolean;
  isVan: boolean;
}

interface SubModel {
  name: string;
  displayName: string;
  engineSize: number;
  engineDescription: number;
  transmissionType: string;
  cabType: string;
  doors: number;
  description: string;
  carBadge: string;
  secondaryBadgeDescription: string;
  type: string;
}
export interface OrderDataResponse {
  orders?: OrderDetailState[];
  order: Order['order'];
  items: ItemElement[];
  customer: CustomerInfo;
  policyHolderAddress: any;
  shippingAddress: null;
  billingAddress: null;
  data: {
    isOfflinePayment: boolean;
  };
  car: Car;
  earliestDeadline?: number;
  payload?: any;
  isCancelled?: boolean;
}

export interface OrderDetailState {
  name: string;
  lead: string;
  createTime: Date;
  updateTime: string;
  deleteTime: null;
  convertBy: string;
  supervisor: string;
  isCancelled: boolean;
  product: string;
  invoicePrice: number | string;
  humanId: string;
  discounts: { amount: number }[];
  payment: string;
  customer: CustomerData;
  schema: string;
  data: Data;
  documentBy: string;
  documentStatus: string;
  qcBy: string;
  qcStatus: string;
  isUrgentDelivery: boolean;
  isFullyPaid: boolean;
  cancelTime: string;
  firstDriverDOB?: string;
  secondDriverDOB?: string;
  car: Car;
  policyHolder: PolicyHolder;
}

export interface Payload {
  orderId: string;
}

export interface HistoryDiff {
  oldValue: string;
  op: string;
  path: string;
  value: string;
}

export interface Patch {
  user: any;
  resource: string;
  version: string;
  diffs: {
    '@type': string;
    value: HistoryDiff[];
  };
}

export interface OrderHistoryResponse {
  baseRecords: any;
  patches: Patch[];
  nextPageToken: string;
}

export interface TransformedOrderHistory {
  timestamp: string;
  name: string;
  action: string;
  resource: string;
  attribute: string;
  oldValue: string;
  newValue: string;
}

export interface TransformedHistoryResponse {
  imports: TransformedOrderHistory[];
  nextPageToken: string;
  pageIndex: string;
  listPageToken: IPageToken[];
}

export interface OrderConfigs extends CommonAPIResponse {
  name: string;
  effectiveDate: string;
  agent: string;
  group: string;
  absent: string;
}

export interface OrderConfigsResponse {
  assignments: {
    config: OrderConfigs;
    user: PresentationUserModel & CommonAPIResponse;
    team: ICreateTeam & CommonAPIResponse;
    attributes: { assignedOrderCount: number };
  }[];
  total: string;
}

export interface TransformedOrderConfigs {
  configId: string;
  status: string;
  group: string;
  name: string;
  effectiveDate: string;
  assignedOrder: number;
}

export interface TransformedOrderConfigsResponse {
  imports: TransformedOrderConfigs[];
  total: number;
}

export interface CreateOrderConfigPayload {
  effectiveDate: string;
  agent: string;
  group: string;
  absent: boolean;
}

export interface OrderDocumentsPayload {
  orderId: string;
  queryParams?: string;
}

export interface Document {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: null;
  createBy: string;
  document: string;
  type: string;
  label: string;
  item: string;
}

export interface OrderDocumentResponse {
  documents: Document[];
  nextPageToken: string;
}
