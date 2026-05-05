import { PRODUCTS } from 'config/TypeFilter';
import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import { store } from 'presentation/redux/store';
import { buildUrl } from 'utils/url';

const formatPayload = (payload: UpdateLeadJsonPayload['payload']) => {
  const globalProduct = (store.getState() as any).typeSelectorReducer
    .globalProductSelectorReducer.data;

  if (globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
    return payload.map((_payload) => {
      const payloadClone = { ..._payload };
      const { path } = _payload;

      if (path === '/customerFirstName') {
        payloadClone.path = '/customer/firstName';
      }
      if (path === '/customerLastName') {
        payloadClone.path = '/customer/lastName';
      }
      if (path === '/customerGender') {
        payloadClone.path = '/customer/gender';
      }
      if (path === '/customerEmail') {
        payloadClone.path = '/customer/emails';
      }
      if (path === '/customerPhoneNumber') {
        payloadClone.path = '/customer/phoneNumbers';
      }
      if (path === '/customerDOB') {
        payloadClone.path = '/customer/dob';
      }
      if (path === '/customerPolicyAddress') {
        payloadClone.path = '/policyAddresses';
      }
      if (path === '/customerShippingAddress') {
        payloadClone.path = '/shippingAddresses';
      }
      if (path === '/customerBillingAddress') {
        payloadClone.path = '/billingAddresses';
      }
      return payloadClone;
    });
  }
  return payload;
};
type UpdateLeadPayload = {
  payload: any;
  leadId: string;
  patchType?: string;
};

export const updateLeadSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateLeadStatus: builder.mutation<any, UpdateLeadPayload>({
      query: ({ payload, leadId, patchType }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/lead/v1alpha2/${leadId}${
            patchType ? `:${patchType}` : ''
          }`,
        }),
        method: 'PATCH',
        body: payload,
      }),
    }),
  }),
});

export const { useUpdateLeadStatusMutation } = updateLeadSlice;

export type UpdateLeadJsonPayload = {
  leadId: string;
  payload: {
    op: 'add' | 'remove' | 'replace';
    path: string;
    value?: any;
  }[];
};

const apiWithTags = apiSlice.enhanceEndpoints({
  addTagTypes: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION', 'LEAD'],
});

export const updateLeadJsonSlice = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    updateLeadJson: builder.mutation<any, UpdateLeadJsonPayload>({
      query: ({ leadId, payload }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/lead/v1alpha2/leads/${leadId}:patchData`,
        }),
        method: 'PATCH',
        body: formatPayload(payload),
      }),
      invalidatesTags: ['PACKAGE_SEARCH', 'PACKAGE_SELECTION', 'LEAD'],
    }),
  }),
});

export const { useUpdateLeadJsonMutation } = updateLeadJsonSlice;
