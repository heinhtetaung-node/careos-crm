import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { packageType as pkgType } from 'presentation/components/QcDetailPage/hooks/usePackagesInfo';
import getApiEndpoint from 'utils/endpointHelper';

import {
  OrderPolicy,
  OrderPackage,
  Package,
  InsurerName,
  Order,
  Car,
  Insurer,
  Item,
  PolicyPayload,
  PolicyApprovalStatusPayload,
  AddOnResponse,
} from './interface';

import { MergeDocumentResponse } from '../shipmentSlice';

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['ORDER', 'POLICY', 'ADDON'],
});

const orderPolicySlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getOrderPolicy: build.query<OrderPolicy, OrderPackage>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { orderId, policyId, hasShippingSection = false } = _arg;
        // Fetch Order data
        const orderDetail: any = await fetchWithBQ(
          `${baseUrls.goBff}/v1alpha1/orders/${orderId}`
        );
        if (orderDetail?.data?.order) {
          try {
            const orderData = orderDetail.data.order as Order;
            const { isCompany, companyName, firstName, lastName } =
              orderDetail?.data.order?.data?.policyHolder || {};

            const policyHolderName = isCompany
              ? companyName
              : `${firstName} ${lastName}`;

            const brand = orderDetail.data.car?.brand;
            const model = orderDetail.data.car?.model;
            const subModel = orderDetail.data.car?.subModel;
            const carYear = orderDetail.data.car?.carYear;
            const car = {
              displayName: `${brand?.displayName} ${model?.displayName} ${subModel?.displayName}`,
              year: carYear,
            } as Car;

            // Find matching Policy in items array
            const itemMatch = orderDetail.data.items.find(
              (itemObj: any) => itemObj.item.humanId === policyId
            );
            if (!itemMatch) throw new Error('No policy match');
            // Fetch car package data for given package id of the Policy
            const packageData = itemMatch.package as Package;
            // TODO: Fetch payment type once API is ready
            const paymentType = 'Rabbit care installment';
            // Policy discounts
            const policyDiscounts = itemMatch.discounts?.map((i: any) =>
              parseInt(i?.amount, 10)
            );
            // Package Type
            let packageType = packageData?.packageType;
            packageType =
              (packageType as string) === ''
                ? (pkgType.STANDARD as any)
                : (pkgType[packageType] as any);

            if (itemMatch.insurer) {
              const insuranceCategory = packageData?.insuranceCategory;
              const { displayName } = itemMatch.insurer as InsurerName;
              // Normalize response for order policy info
              return {
                data: {
                  order: {
                    ...orderData,
                    car,
                  },
                  ...(hasShippingSection && {
                    hasMultiplePolicies: orderDetail.data?.items.length > 1,
                    insuranceCategory,
                  }),
                  policy: {
                    ...itemMatch.item,
                    discount: policyDiscounts,
                  },
                  paymentType,
                  motorPackage: {
                    ...packageData,
                    insurerName: displayName,
                  },
                  customerInfo: orderDetail.data?.customer,
                  policyHolderName,
                  packageType,
                },
              };
            }
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
        }
        return { error: orderDetail.error as FetchBaseQueryError };
      },
      providesTags: ['POLICY'],
    }),
    // delete this mutation, duplicated
    updatePolicy: build.mutation<Item, Insurer>({
      query: (payload) => {
        const { orderId, policyId, ...updateFields } = payload;
        const validUpdateFields: Record<string, any> = {};
        Object.entries(updateFields).forEach(([key, value]) => {
          if (value !== null || value !== undefined) {
            validUpdateFields[key] = value;
          }
        });

        return {
          url: `${basePaths.order}/orders/${orderId}/items/${policyId}`,
          method: 'PATCH',
          body: {
            ...validUpdateFields,
          },
        };
      },
      invalidatesTags: ['POLICY'],
    }),
    updatePolicyData: build.mutation<Item, PolicyPayload>({
      query: ({ orderId, policyId, payload }) => ({
        url: `${basePaths.order}/orders/${orderId}/items/${policyId}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER'],
    }),
    updatePolicyApprovalStatus: build.mutation<
      any,
      PolicyApprovalStatusPayload
    >({
      query: ({ name, status }) => ({
        url: `${basePaths.order}/${name}:updateItemApprovalStatus`,
        method: 'PATCH',
        body: {
          name,
          status,
        },
      }),
      invalidatesTags: ['POLICY'],
    }),
    getCovernote: build.mutation<MergeDocumentResponse, PolicyPayload>({
      query: ({ policyId, payload }) => ({
        url: `${baseUrls.goBff}/v1alpha1/${policyId}:generateCovernote`,
        method: 'POST',
        body: payload,
      }),
    }),
    getAddons: build.query<
      AddOnResponse,
      { policyId?: string; orderId: string }
    >({
      query: ({ policyId = '-', orderId }) => ({
        url: getApiEndpoint(
          `${basePaths.order}/orders/${orderId}/items/${policyId}/addons` // also support /items/-/addons
        ),
      }),
      providesTags: ['ADDON'],
    }),
  }),
});

export const {
  useGetOrderPolicyQuery,
  useUpdatePolicyMutation,
  useUpdatePolicyDataMutation,
  useUpdatePolicyApprovalStatusMutation,
  useGetCovernoteMutation,
  useGetAddonsQuery,
} = orderPolicySlice;
