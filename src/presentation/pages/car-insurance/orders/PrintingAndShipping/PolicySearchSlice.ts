import { basePaths, apiSlice } from 'data/slices/apiSlice';
import { ShipmentResponse } from 'data/slices/shipmentSlice';
import { getProductName } from 'presentation/components/common/InfoPanel/Insurance/Insurance.helper';
import {
  formatMotoType,
  formatApprovalStatus,
  formatDocumentStatus,
  formatQCStatus,
  formatSubmissionStatus,
  formatInsuranceCompany,
  formatPrintingStatus,
} from 'presentation/components/OrderListingTable/helper';
import { ShipmentMethods } from 'shared/constants/orderType';

import { formatDateTime } from './helper';

interface PolicyItem {
  name: string;
  humanId?: string;
}

interface Shipment {
  courierProvider: string;
  createTime: string;
  deliveryTime: string;
  name: string;
  order: string;
  shipmentMethod: string;
  statusUpdateTime: string;
  trackingNumber: string;
  shipmentStatus: string;
}

type shipmentStatusProps = {
  shipmentStatus: string;
  statusUpdateTime: string;
};

interface ShipmentTransformResponse {
  deliveredByEmail?: shipmentStatusProps;
  deliveredByCourier?: shipmentStatusProps;
  trackingNumber?: string;
}

const getPolicyName = (item: PolicyItem) => item.name.split('/')[1];

const formatPolicyLink = (item: PolicyItem) => {
  const orderId = getPolicyName(item);
  const policyId = item.humanId;
  return `${orderId}/policies/${policyId}/printing-and-shipping`;
};

export const formatShipmentMethods = (
  shipments: ShipmentResponse[] = []
): ShipmentTransformResponse =>
  shipments.reduce<ShipmentTransformResponse>(
    (
      otherMethods,
      { shipmentMethod, shipmentStatus, statusUpdateTime, trackingNumber }
    ) => {
      if (shipmentMethod === ShipmentMethods.SHIPMENT_METHOD_COURIER) {
        return {
          ...otherMethods,
          deliveredByCourier: { shipmentStatus, statusUpdateTime },
          trackingNumber,
        };
      }

      return {
        ...otherMethods,
        deliveredByEmail: {
          shipmentStatus,
          statusUpdateTime,
        },
      };
    },
    {}
  );

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['SHIPMENT'] });

const policySlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getPolicies: build.query<any, string>({
      query: (search) => ({
        url: `${basePaths.searchSvc}/orders/-/items?${search}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response.total > 0) {
          const updatedItems = response.items.map((item: any) => ({
            name: item?.item ? getPolicyName(item.item) : '',
            policyId: item?.item?.humanId,
            id: item?.item ? formatPolicyLink(item.item) : '',
            orderId: item?.item?.humanId,
            insuranceCategory: getProductName(item?.item?.product),
            insuranceType: item?.item?.motorItemType
              ? formatMotoType(item.item.motorItemType).toLowerCase()
              : '',
            insuranceCompany: formatInsuranceCompany(item?.insurer),
            totalPremium: item?.item?.grossPremium,
            documentStatus: formatDocumentStatus(item?.item?.documentStatus),
            qcStatus: formatQCStatus(item?.item?.qcStatus),
            submissionStatus: formatSubmissionStatus(
              item?.item?.submissionStatus
            ),
            approvalStatus: formatApprovalStatus(item?.item?.approvalStatus),
            printingAndShippingStatus: formatPrintingStatus(
              item?.item?.printingAndShippingStatus
            ),
            timeSinceInsuranceApproved: '-',
            deliveryOption: '-',
            insuranceApproved: '-',
            policyStartDate: '-',
            createdOn: formatDateTime(item?.item?.createTime),
            orderCreated: item?.item?.createTime,
            updatedOn: formatDateTime(item?.item?.updateTime),
            // TODO: Remove mock data once fields are available from BE
            paymentType: item?.item?.paymentType ?? 'One-time',
            paymentStatus: '-',
            insuredPerson: item?.attributes?.policyHolder
              ? `${item.attributes.policyHolder.firstName} ${item.attributes.policyHolder.lastName}`
              : '-',
            policyNumber: item?.item?.policyNumber,
            trackingNumber: item?.item?.trackingNumber,
            customer: item?.customer
              ? `${item?.customer?.firstName} ${item?.customer?.lastName}`
              : '',
            isCancelled: item?.item?.isCancelled,
            phoneNumber: item?.customer?.phoneNumer ?? '0810896177',
            email: item?.customer?.email ?? 'pattawatc@rabbit.co.th',
            licensePlate: item?.attributes?.carLicensePlate ?? 'nn-0003',
            chassisNumber:
              item?.attributes?.chassisNumber ?? 'กท MRHGN7860NT105658',
          }));
          return {
            items: updatedItems,
            total: response.total,
          };
        }
        return response;
      },
    }),
    getShipments: build.query<
      Record<string, ShipmentTransformResponse>,
      string
    >({
      query: (orderId) => ({
        url: `${basePaths.shipment}/${orderId}/shipments:getLatest`,
        method: 'GET',
      }),
      transformResponse: (response: {
        shipments: Record<string, Record<'shipments', Shipment[]>>;
      }) => {
        const { shipments: shipmentsResp } = response;
        return Object.entries(shipmentsResp).reduce<
          Record<string, ShipmentTransformResponse>
        >((prevPolicies, [itemName, { shipments }]) => {
          const transformShipments =
            shipments.reduce<ShipmentTransformResponse>(
              (otherShipmentMethods, shipment) => {
                const {
                  deliveryTime,
                  trackingNumber,
                  shipmentStatus,
                  statusUpdateTime,
                  shipmentMethod,
                } = shipment;
                if (
                  shipmentMethod === ShipmentMethods.SHIPMENT_METHOD_COURIER
                ) {
                  return {
                    ...otherShipmentMethods,
                    deliveredByCourier: {
                      shipmentStatus,
                      statusUpdateTime,
                    },
                    trackingNumber,
                  };
                }
                if (shipmentMethod === ShipmentMethods.SHIPMENT_METHOD_EMAIL) {
                  return {
                    ...otherShipmentMethods,
                    deliveredByEmail: {
                      shipmentStatus,
                      statusUpdateTime: deliveryTime,
                    },
                  };
                }

                return {
                  ...otherShipmentMethods,
                };
              },
              {}
            );
          return { ...prevPolicies, [itemName]: transformShipments };
        }, {});
      },
      providesTags: ['SHIPMENT'],
    }),
  }),
});

export const {
  useLazyGetPoliciesQuery,
  useGetShipmentsQuery,
  useLazyGetShipmentsQuery,
} = policySlice;
