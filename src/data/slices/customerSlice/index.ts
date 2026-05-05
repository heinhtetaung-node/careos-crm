import { AnyObject } from 'yup';

import { ArrayToQueryString } from 'data/gateway/api/services/customer';
import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { HookParams } from 'presentation/hooks/useTableList';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { satangToBaht } from 'utils/currency';
import getApiEndpoint from 'utils/endpointHelper';
import { buildUrl } from 'utils/url';

import transformCustomerProfiles from './helper';
import {
  GetConnectedLeadResponse,
  GetConnectedLeadPayload,
  GetUserPayload,
  GetUserResponse,
  GetEmailPayload,
  GetEmailResponse,
  NewCustomerPayload,
  APIResponse,
  EmailResponse,
  PhoneResponse,
  UpdateCustomerPayload,
  CustomerPhoneResponse,
  CustomerLeadResponse,
  GetCustomerPhoneNumberPayload,
  TransformedOrder,
  TransformedCustomerProfiles,
  CustomerProfileResponse,
} from './types';

import { CustomerResponse } from '../leadSlice/types';
import { Order } from '../orderPolicySlice/interface';

const NUMBER_OF_CUSTOMERS = 6;

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['ORDER', 'CUSTOMER_INFO', 'CUSTOMER_PHONES'],
});

const customerSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getConnectedLeads: build.query<
      GetConnectedLeadResponse,
      GetConnectedLeadPayload
    >({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { leadId, currentCustomer } = _arg;
        const { data: leadResp }: AnyObject = await fetchWithBQ({
          url: `${basePaths.customer}/customers/-/leads?filter=lead="${leadId}"`,
          method: 'GET',
        });

        if (leadResp?.leads?.length === 0) {
          const { customerPhoneNumber, primaryPhoneIndex } =
            currentCustomer.data;
          const AdditionalParam = `&orderBy=updateTime desc&primaryOnly=true`;

          let leadPhoneNumber = customerPhoneNumber;
          let _primaryPhoneIndex = primaryPhoneIndex;

          if (currentCustomer?.data?.customer) {
            const healthCustomer = currentCustomer.data.customer;
            leadPhoneNumber = healthCustomer.phoneNumbers;
            _primaryPhoneIndex = healthCustomer.primaryPhoneIndex;
          }

          const { data: phoneRes }: APIResponse = await fetchWithBQ({
            url: `${
              basePaths.customer
            }/customers/-/phones?filter=${ArrayToQueryString('phone', [
              leadPhoneNumber[_primaryPhoneIndex]?.phone,
            ])}${AdditionalParam}`,
            method: 'GET',
          });

          if (phoneRes?.phones?.length > 0) {
            const filteredPhones: PhoneResponse[] = phoneRes.phones.filter(
              (_: PhoneResponse, index: number) =>
                index <= NUMBER_OF_CUSTOMERS - 1
            );

            return {
              data: {
                leads: filteredPhones,
                isModal: null,
                hasLead: false,
              },
            };
          }
          return {
            data: {
              leads: [],
              isModal: null,
              hasLead: false,
            },
          };
        }
        return {
          data: {
            leads: null,
            isModal: null,
            customer: leadResp?.leads?.[0] ?? null,
          },
        };
      },
    }),
    getUserFromPhoneNumber: build.query<GetUserResponse, GetUserPayload>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { phones } = _arg;

        let CustomerList: CustomerResponse[] = [];
        const customers: Promise<APIResponse>[] = phones.map(
          async (phone: PhoneResponse) => {
            const [key, customerName] = phone.name.split('/');

            const customer: APIResponse = await fetchWithBQ({
              url: `${basePaths.customer}/${key}/${customerName}`,
              method: 'GET',
            });
            return customer;
          }
        );

        await Promise.all(customers).then((res) => {
          const customerData = res?.map<CustomerResponse>(
            (arr: AnyObject) => arr?.data
          );
          CustomerList = customerData.filter(
            (data, index, self) =>
              index === self.findIndex((t) => t.name === data.name)
          );
        });

        return {
          data: {
            customers: CustomerList,
          },
        };
      },
    }),
    getCustomerEmail: build.query<GetEmailResponse, GetEmailPayload>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { customerId, currentCustomer } = _arg;
        const customerEmail = currentCustomer?.data
          ? currentCustomer.data?.customerEmail
          : [];

        const { data: fetchedEmails }: APIResponse = await fetchWithBQ({
          url: `${basePaths.customer}/${customerId}/emails`,
          method: 'GET',
        });

        const allEmails: string[] =
          fetchedEmails?.emails?.map((email: EmailResponse) => email.email) ??
          [];

        const matchedEmail: any[] =
          fetchedEmails?.emails?.filter((e: AnyObject) =>
            customerEmail?.includes(e.email)
          ) || [];

        return {
          data: {
            all: fetchedEmails?.emails ?? [],
            allEmails,
            emails: matchedEmail,
          },
        };
      },
    }),
    getCustomer: build.query<Record<string, any>, string>({
      query: (customerName) => ({
        url: `${basePaths.customer}/${customerName}`,
        method: 'GET',
      }),
      providesTags: ['CUSTOMER_INFO'],
    }),
    getCustomerLeads: build.query<{ leads: CustomerLeadResponse[] }, string>({
      query: (customerName) => ({
        url: `${basePaths.customer}/${customerName}/leads?orderBy=createTime desc`,
        method: 'GET',
      }),
    }),
    getCustomerPhoneNumber: build.query<
      CustomerPhoneResponse,
      GetCustomerPhoneNumberPayload
    >({
      query: ({ customerName, filter = '' }) => {
        const filterQuery = filter !== '' ? `?filter=${filter}` : '';
        return {
          url: `${basePaths.customer}/${customerName}/phones${filterQuery}`,
          method: 'GET',
        };
      },
      providesTags: ['CUSTOMER_PHONES'],
    }),
    createNewCustomer: build.mutation<CustomerLeadResponse, NewCustomerPayload>(
      {
        query: ({ firstName, lastName, createBy, dateOfBirth, gender }) => ({
          url: `${basePaths.customer}/customers`,
          method: 'POST',
          body: { firstName, lastName, createBy, dateOfBirth, gender },
        }),
      }
    ),
    createCustomerEmail: build.mutation<
      EmailResponse,
      { email: string; customerName: string }
    >({
      query: ({ email, customerName }) => ({
        url: `${basePaths.customer}/${customerName}/emails`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['ORDER'],
    }),
    createPhoneNumber: build.mutation<
      PhoneResponse,
      { phone: string; customerName: string }
    >({
      query: ({ phone, customerName }) => ({
        url: `${basePaths.customer}/${customerName}/phones`,
        method: 'POST',
        body: { phone },
      }),
      invalidatesTags: ['CUSTOMER_PHONES'],
    }),
    deletePhoneNumber: build.mutation<PhoneResponse, { phone: string }>({
      query: ({ phone }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.customer}/${phone}`,
        }),
        method: 'DELETE',
      }),
    }),
    updateCustomer: build.mutation<any, UpdateCustomerPayload>({
      query: ({ customerId, payload }) => ({
        url: `${basePaths.customer}/${customerId}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER', 'CUSTOMER_INFO', 'CUSTOMER_PHONES'],
    }),
    getCustomerOrders: build.query<TransformedOrder[], string>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const transformedOrders: TransformedOrder[] = [];
        const { data: orders }: APIResponse = await fetchWithBQ({
          url: getApiEndpoint(
            `${CONSTANTS.apiEndpoint.getOrdersList}?filter=customer.name="${_arg}"`
          ),
          method: 'GET',
        });

        orders?.orders?.map((item: Order) =>
          transformedOrders.push({
            orderId: item.order.humanId,
            paymentStatus: item.order.isFullyPaid
              ? getString('tableListing.fullyPaid')
              : getString('tableListing.notFullyPaid'),
            carPlate: item.order.data.carLicensePlate,
            totalInvoice: satangToBaht(item.order.invoicePrice as string),
          })
        );

        return {
          data: transformedOrders,
        };
      },
    }),
    getCustomerProfiles: build.query<TransformedCustomerProfiles, HookParams>({
      query: ({ queryParams }) => {
        const { pageSize, currentPage, filter } = queryParams;

        return {
          url: getApiEndpoint(
            `${CONSTANTS.apiEndpoint.leadAssignment}/customers`
          ),
          method: 'GET',
          params: {
            filter,
            page_size: pageSize,
            page_from: ((currentPage as number) - 1) * (pageSize as number),
          },
        };
      },
      transformResponse: (response: CustomerProfileResponse) => ({
        imports: transformCustomerProfiles(response),
        total: response.total,
      }),
    }),
  }),
});

export const {
  useGetCustomerQuery,
  useGetCustomerLeadsQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerEmailQuery,
  useGetConnectedLeadsQuery,
  useGetUserFromPhoneNumberQuery,
  useGetCustomerPhoneNumberQuery,
  // Lazy Queries
  useLazyGetCustomerQuery,
  useLazyGetCustomerLeadsQuery,
  useLazyGetCustomerEmailQuery,
  useLazyGetConnectedLeadsQuery,
  useLazyGetUserFromPhoneNumberQuery,
  useLazyGetCustomerPhoneNumberQuery,
  useLazyGetCustomerOrdersQuery,
  useLazyGetCustomerProfilesQuery,
  // Mutations
  useUpdateCustomerMutation,
  useCreatePhoneNumberMutation,
  useCreateNewCustomerMutation,
  useCreateCustomerEmailMutation,
  useDeletePhoneNumberMutation,
} = customerSlice;

// TODO: Fix me, types
export const useGetConnectedLeadsSelector = (args: GetConnectedLeadPayload) =>
  useAppSelector(
    (state) =>
      customerSlice.endpoints.getConnectedLeads.select(args)(state as any)?.data
  );
