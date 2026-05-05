/* eslint-disable no-param-reassign */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import differenceInDays from 'date-fns/differenceInDays';
import _keyBy from 'lodash/keyBy';
import _set from 'lodash/set';

import { updateTokenList } from 'data/gateway/api/helper/queryString.helper';
import { apiSlice, basePaths, baseUrls } from 'data/slices/apiSlice';
import userSlice from 'data/slices/userSlice';

import { HookParams } from 'presentation/hooks/useTableList';
import { CancellationReasons, OrderType } from 'shared/constants/orderType';
import { User } from 'shared/types/user';
import getApiEndpoint from 'utils/endpointHelper';
import { buildUrl } from 'utils/url';

import {
  formatOrderResponseByType,
  transformOrderConfigsResponse,
  transformOrderResponse,
} from './helper';
import {
  CreateOrderConfigPayload,
  OrderConfigs,
  OrderConfigsResponse,
  OrderDataResponse,
  OrderDocumentResponse,
  OrderDocumentsPayload,
  OrderHistoryResponse,
  Payload,
  TransformedHistoryResponse,
  TransformedOrderConfigsResponse,
} from './interface';

import {
  Item,
  ItemElement,
  Order,
  OrderItems,
} from '../orderPolicySlice/interface';

const itemsOrder = [
  'MOTOR_TYPE_COMPULSORY',
  'MOTOR_TYPE_1',
  'MOTOR_TYPE_2_PLUS',
  'MOTOR_TYPE_3_PLUS',
  'MOTOR_TYPE_2',
  'MOTOR_TYPE_3',
];

const sortFn = (a: ItemElement, b: ItemElement) =>
  itemsOrder.indexOf(a.item.motorItemType) -
  itemsOrder.indexOf(b.item.motorItemType);

interface UpdatePayload {
  payload: Record<string, any>;
  orderId: string;
}

interface AgentAssignPayload {
  payload: {
    assign_type: OrderType;
    resources: string[];
    assignee: string;
  };
}

interface AgentAssignResponse {
  resources: string[];
}

interface OrderResponse {
  items: Order[];
  orders: Order[];
  total: number;
}

export interface CreateLead {
  createLead: boolean;
  reason?: CancellationReasons;
  changeOrder?: boolean;
  customerRequest?: string;
  waive_fees?: boolean;
}

interface CancelPayload {
  orderId?: string;
  policyId?: string;
  payload?: CreateLead;
  customerRequest?: string;
}

interface OrderCancelResponse {
  leadHumanId: string;
  leadName: string;
  order: any;
}

interface Status {
  label: string;
  status: string;
  type: string;
}

export interface OrderTransform {
  id: string;
  orderId: string;
  orderCreated: Date;
  customer: string;
  companyName: string;
  isCompany: boolean;
  insuredPerson: string;
  licensePlate: string;
  assignedTo: string;
  insurancePackage: string[];
  convertBy: string;
  documentStatus: Status;
  documentsStatus: Status;
  qcStatus: Status;
  policyStartDate: string;
  earliestPolicyStartDate: string;
  products: any[];
  deliveryOption: string;
  timeSinceDocumentsComplete: string;
  salesAgent?: string | User;
  website: string;
  paymentTerms: string;
  paymentStatus: boolean;
  totalNetPremium: string;
  totalInvoiced: string;
  discount: string;
  isStar: boolean;
  isChecked: boolean;
}

interface SearchOrderResponse {
  orders: OrderTransform[];
  total: number;
}

export interface SearchOrderPayload {
  queryParams?: Record<string, any>;
  params?: string;
  assignedTo?: string;
  roles?: string[];
  usersQueryPageSize?: number;
}

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['ORDER'] });

const fetchDocumentsRecursive = async (
  orderId: string,
  queryParams: string,
  updateCachedData: (draft: any) => void,
  nextPageToken: string = ''
): Promise<void> => {
  if (!nextPageToken) {
    return;
  }

  const response = await fetch(
    getApiEndpoint(
      `${basePaths.order}/${orderId}/documents?${queryParams}&pageToken=${nextPageToken}`
    ),
    { credentials: 'include' }
  );

  const data = await response.json();

  updateCachedData((draft: any) => {
    // eslint-disable-next-line no-param-reassign -- Immer draft mutation
    draft.documents = [...draft.documents, ...(data.documents || [])];
    // eslint-disable-next-line no-param-reassign -- Immer draft mutation
    draft.nextPageToken = data.nextPageToken;
  });

  if (data.nextPageToken) {
    // Recursively call with the next page token
    await fetchDocumentsRecursive(
      orderId,
      queryParams,
      updateCachedData,
      data.nextPageToken
    );
  }
};

export const orderSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    searchOrders: build.query<SearchOrderResponse, SearchOrderPayload>({
      async queryFn(
        {
          queryParams,
          params,
          assignedTo = '',
          roles = [],
          usersQueryPageSize = 500,
        },
        api,
        _,
        fetchWithBQ
      ) {
        const orderItemsPath =
          queryParams?.type === 'cancellation' ? '/-/items' : '';
        const orderParams = queryParams
          ? new URLSearchParams(queryParams).toString()
          : params;
        const rolesParams = [...roles, '"roles/sales"'];
        const userParams = `pageSize=${usersQueryPageSize}&filter=role in(${rolesParams.join(
          ','
        )})&showDeleted=true`;
        const usersResponse = await api.dispatch(
          userSlice.endpoints.getUsers.initiate(userParams)
        );
        let usersMap!: Record<string, User>;
        if (usersResponse) {
          usersMap = usersResponse.error
            ? {}
            : _keyBy(usersResponse.data?.users, 'name');
        }

        const ordersResponse = (await fetchWithBQ({
          url: `${basePaths.searchSvc}/orders${orderItemsPath}?${orderParams}`,
          method: 'GET',
        })) as QueryReturnValue<OrderResponse, FetchBaseQueryError>;

        if (ordersResponse.error) {
          return { error: ordersResponse.error } as any;
        }
        const updatedOrders = formatOrderResponseByType(
          ordersResponse.data?.orders ?? ordersResponse.data?.items,
          { assignedTo, usersMap, type: queryParams?.type || '' }
        );

        const defaultResponse = { total: ordersResponse.data?.total };
        if (queryParams?.type === 'travel-allOrders') {
          return {
            data: {
              imports: updatedOrders,
              ...defaultResponse,
            },
          };
        }
        return {
          data: { orders: updatedOrders, ...defaultResponse },
        };
      },
    }),
    getOrderItems: build.query<OrderDataResponse, Payload>({
      query: ({ orderId }) => ({
        url: `${baseUrls.goBff}/v1alpha1/orders/${orderId}`,
        method: 'GET',
      }),
      providesTags: ['ORDER'],
      transformResponse: (response: OrderDataResponse) => {
        if (response.items.length) {
          const sortedItems = [...response.items];
          sortedItems.sort(sortFn);

          const policies = sortedItems
            .slice()
            .sort(
              (a, b) =>
                new Date(a.item.policyStartDate).getTime() -
                new Date(b.item.policyStartDate).getTime()
            );

          const earliestDeadline = differenceInDays(
            new Date(policies[0].item.policyStartDate),
            new Date()
          );

          return {
            ...response,
            items: sortedItems,
            earliestDeadline,
          };
        }
        return response;
      },
    }),
    getOrderPolicyItems: build.query<Item[], string>({
      query: (orderId) => `${basePaths.order}/orders/${orderId}/items`,
      transformResponse: (response: OrderItems) => {
        const sortedItems = [...response.items];
        sortedItems.sort(
          (a, b) =>
            itemsOrder.indexOf(a.motorItemType) -
            itemsOrder.indexOf(b.motorItemType)
        );

        return sortedItems;
      },
    }),
    updateOrderData: build.mutation<OrderDataResponse, UpdatePayload>({
      query: ({ payload, orderId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.order}/orders/${orderId}:patchData`,
        }),
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER'],
    }),
    updateOrderById: build.mutation<OrderDataResponse, UpdatePayload>({
      query: ({ payload, orderId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.order}/orders/${orderId}`,
        }),
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER'],
    }),
    updateOrderItemById: build.mutation<OrderDataResponse, any>({
      query: ({ payload, itemId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.gff}/${itemId}:update`,
        }),
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER'],
    }),
    getOrderByLeadId: build.query<OrderDataResponse, any>({
      query: ({ leadId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.order}/orders?filter=humanId="${leadId}"`,
        }),
        method: 'GET',
      }),
    }),
    agentAssignment: build.mutation<AgentAssignResponse, AgentAssignPayload>({
      query: ({ payload }) => ({
        url: `${baseUrls.goBff}/v1alpha1/orders/assign`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['ORDER'],
    }),
    cancelOrder: build.mutation<OrderCancelResponse, CancelPayload>({
      query: ({ orderId, payload = {} }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `v1alpha1/${orderId}:cancel`,
        }),
        method: 'PATCH',
        body: {
          create_lead: payload.createLead,
          reason: payload.reason,
          ...(payload?.changeOrder
            ? { change_order: payload?.changeOrder }
            : {}),
          ...(payload?.customerRequest
            ? { customerRequest: payload?.customerRequest }
            : {}),
          ...(payload?.waive_fees ? { waive_fees: payload?.waive_fees } : {}),
        },
      }),
    }),
    cancelOrderPolicies: build.mutation<OrderCancelResponse, CancelPayload>({
      query: ({
        policyId,
        payload: {
          createLead = false,
          reason,
          changeOrder = false,
          customerRequest,
        } = {},
      }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `v1alpha1/${policyId}:cancel`,
        }),
        method: 'PATCH',
        body: {
          create_lead: createLead,
          ...(reason && { reason }),
          ...(changeOrder && { change_order: changeOrder }),
          ...(customerRequest ? { customerRequest } : {}),
        },
      }),
    }),
    getOrderHistory: build.query<TransformedHistoryResponse, HookParams>({
      query: ({ queryParams }) => {
        const { orderId, pageToken } = queryParams;
        const token = pageToken ? `?pageToken=${pageToken}` : '';
        return {
          url: `${baseUrls.goBff}/v1alpha1/orders/${orderId}/resourceHistory${token}`,
          method: 'GET',
        };
      },
      transformResponse: (response: OrderHistoryResponse, _meta, _arg: any) => {
        const { queryParams, listPageToken } = _arg;
        return {
          imports: transformOrderResponse(response),
          nextPageToken: response?.nextPageToken,
          pageIndex: queryParams.currentPage,
          listPageToken: updateTokenList(
            queryParams.currentPage + 1,
            response?.nextPageToken,
            listPageToken
          ),
        };
      },
    }),
    getOrderConfigs: build.query<TransformedOrderConfigsResponse, HookParams>({
      query: ({ queryParams }) => {
        const { pageSize, currentPage, filter, orderBy } = queryParams;
        const _params = { pageSize, currentPage: (currentPage as number) - 1 };
        if ((orderBy?.length as number) > 0) {
          _set(_params, 'orderBy', orderBy);
        }
        return {
          url: getApiEndpoint(
            `/api/lead-search/v1alpha1/search/autoassignments/orders?filter=${filter}`
          ),
          method: 'GET',
          params: _params,
        };
      },
      transformResponse: (
        response: OrderConfigsResponse,
        _meta,
        _arg: any
      ) => ({
        imports: transformOrderConfigsResponse(response?.assignments),
        total: parseInt(response?.total, 10),
      }),
    }),
    updateOrderConfigStatus: build.mutation<
      OrderConfigsResponse,
      { absent: boolean; id: string }
    >({
      query: ({ absent, id }) => ({
        url: getApiEndpoint(`/api/autoassign/v1alpha1/orderConfigs/${id}`),
        method: 'PATCH',
        body: { absent },
      }),
    }),
    createOrderConfig: build.mutation<OrderConfigs, CreateOrderConfigPayload>({
      query: (payload) => ({
        url: getApiEndpoint(`/api/autoassign/v1alpha1/orderConfigs`),
        method: 'POST',
        body: payload,
      }),
    }),
    deleteOrderConfig: build.mutation<OrderConfigsResponse, { id: string }>({
      query: ({ id }) => ({
        url: getApiEndpoint(`/api/autoassign/v1alpha1/orderConfigs/${id}`),
        method: 'DELETE',
      }),
    }),
    getAllOrderDocumentsByStreaming: build.query<
      OrderDocumentResponse,
      OrderDocumentsPayload
    >({
      query: ({ orderId, queryParams = '' }) => ({
        url: getApiEndpoint(
          `${basePaths.order}/${orderId}/documents${
            queryParams ? `?${queryParams}` : ''
          }`
        ),
        method: 'GET',
      }),
      async onCacheEntryAdded(
        { orderId, queryParams },
        { updateCachedData, cacheDataLoaded, getCacheEntry }
      ) {
        await cacheDataLoaded;
        const { data: { nextPageToken } = {} } = getCacheEntry();
        await fetchDocumentsRecursive(
          orderId,
          queryParams ?? '',
          updateCachedData,
          nextPageToken
        );
      },
    }),
    getOrderItemDocuments: build.query<any, any>({
      query: ({ orderId, itemId }) => ({
        url: getApiEndpoint(
          `${basePaths.order}/${orderId}/documents?filter=item=${itemId}`
        ),
        method: 'GET',
      }),
    }),
  }),
});

export const assignCacheUpdate = (
  originalArgs: any,
  assignedTo: any,
  orderIds: string[],
  policyLevel = false
) =>
  orderSlice.util.updateQueryData(
    'searchOrders',
    originalArgs,
    (cachedOrders) => {
      // order level
      const ordersMap = _keyBy(cachedOrders.orders, 'id');
      if (!policyLevel) {
        orderIds.forEach((orderId) => {
          const id = orderId.split('/')[1];
          ordersMap[id].assignedTo = assignedTo;
        });
        return;
      }
      // policy level
      orderIds.forEach((orderId) => {
        const id = orderId.split('/')[1];
        const policiesMap = _keyBy(ordersMap[id].products, 'name');
        policiesMap[orderId].assignedTo = assignedTo;
      });
    }
  );
export const {
  useSearchOrdersQuery,
  useLazySearchOrdersQuery,
  useGetOrderItemsQuery,
  useLazyGetOrderItemsQuery,
  useUpdateOrderDataMutation,
  useUpdateOrderByIdMutation,
  useGetOrderPolicyItemsQuery,
  useLazyGetOrderPolicyItemsQuery,
  useCancelOrderMutation,
  useCancelOrderPoliciesMutation,
  useLazyGetOrderHistoryQuery,
  useLazyGetOrderConfigsQuery,
  useUpdateOrderConfigStatusMutation,
  useCreateOrderConfigMutation,
  useDeleteOrderConfigMutation,
  useGetAllOrderDocumentsByStreamingQuery,
  useAgentAssignmentMutation,
  useLazyGetOrderItemDocumentsQuery,
  useLazyGetOrderByLeadIdQuery,
  useUpdateOrderItemByIdMutation,
  useGetOrderByLeadIdQuery,
} = orderSlice;

// Export for testing
export { fetchDocumentsRecursive };
