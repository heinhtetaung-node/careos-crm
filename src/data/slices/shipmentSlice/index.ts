/* eslint-disable no-param-reassign */
import _findIndex from 'lodash/findIndex';
import { buildUrl } from 'utils/url';

import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { DocumentType as ShipmentDocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import {
  MotoTypes as InsuranceType,
  PackageType,
  ShipmentMethods,
} from 'shared/constants/orderType';

import { OrderTransform } from '../orderSlice';

interface DocumentPayload {
  insurerId: string;
  packageType: PackageType;
  insuranceType: `${InsuranceType}`;
}

type DocumentType = {
  documentType: string;
  required: boolean;
};

interface DocumentResponse {
  documents: DocumentType[];
}

export interface ShipmentMethodPayload {
  orderId: string;
  payload: Record<string, any>;
}

export interface ShipmentOrderPoliciesType {
  orderId: string;
  items: string[];
  insurers: string[];
  approvalStatuses: string[];
  noOfPolicies?: number; // no of policies that a expanded order has
}

export interface ShipmentResponse {
  name: string;
  createTime: string | null;
  updateTime: string | null;
  deleteTime: string | null;
  order: string;
  createdBy: string;
  shipmentMethod: string;
  courierProvider: string;
  trackingNumber: string;
  deliveryTime: string | null;
  items: string[];
  shipmentStatus: string;
  statusUpdateTime: string;
}

interface MergeDocumentsPayload {
  items: string[];
  insurer: string;
  document_types: ShipmentDocumentType[];
}

export interface MergeDocumentResponse {
  documentName: string;
}

interface Patch {
  shipmentStatus: string;
  statusUpdateTime: string;
}

export function updatePolicyShipmentMethod(
  item: OrderTransform['products'][number],
  method: ShipmentMethods,
  patch: Patch,
  trackingNumber: string
) {
  if (method === ShipmentMethods.SHIPMENT_METHOD_COURIER) {
    item.deliveredByCourier = patch;
    item.trackingNumber = trackingNumber;
    return;
  }

  item.deliveredByEmail = patch;
}

export function updateOrderPolicies(
  order: OrderTransform,
  items: string[],
  patch: Patch,
  shipmentMethod: ShipmentMethods,
  trackingNumber: string
) {
  items.forEach((item) => {
    const index = _findIndex(order.products, ['name', item]);
    const product = order.products[index];
    updatePolicyShipmentMethod(product, shipmentMethod, patch, trackingNumber);
  });
}

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['SHIPMENT'] });

const shipmentSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getShipmentDocs: build.query<DocumentResponse, DocumentPayload>({
      query: ({ insurerId, packageType, insuranceType }) => ({
        url: `${basePaths.car}/${insurerId}/products/car-insurance/documents?motorPackageFilter.packageType=${packageType}&motorPackageFilter.carInsuranceType=${insuranceType}`,
        method: 'GET',
      }),
    }),
    createShipment: build.mutation<ShipmentResponse, ShipmentMethodPayload>({
      query: ({ orderId, payload }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.shipment}/${orderId}/shipments`,
        }),
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['SHIPMENT'],
    }),
    mergePolicyDocuments: build.mutation<
      MergeDocumentResponse,
      MergeDocumentsPayload
    >({
      query: (payload) => ({
        url: `${baseUrls.goBff}/v1alpha1/orders/-/documents:merge`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useLazyGetShipmentDocsQuery,
  useCreateShipmentMutation,
  useMergePolicyDocumentsMutation,
} = shipmentSlice;
