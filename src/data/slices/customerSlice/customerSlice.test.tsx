import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import * as CONSTANTS from 'shared/constants';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import {
  useCreatePhoneNumberMutation,
  useCreateCustomerEmailMutation,
  useCreateNewCustomerMutation,
  useLazyGetConnectedLeadsQuery,
  useLazyGetCustomerEmailQuery,
  useLazyGetCustomerQuery,
  useLazyGetUserFromPhoneNumberQuery,
  useUpdateCustomerMutation,
  useLazyGetCustomerPhoneNumberQuery,
  useLazyGetCustomerLeadsQuery,
  useLazyGetCustomerOrdersQuery,
  useDeletePhoneNumberMutation,
  useLazyGetCustomerProfilesQuery,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const leadId = 'leads/9aca2b1f-e85e-4b9a-8f13-e7e53f2aa211';
const customerId = 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda';
const DemoLeadResp = {
  leads: [
    {
      name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/leads/9aca2b1f-e85e-4b9a-8f13-e7e53f2aa211',
      lead: leadId,
      createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
      createTime: '2022-04-28T09:17:24.440718Z',
      updateTime: '2022-04-28T09:17:24.440718Z',
      deleteTime: null,
    },
  ],
};
const DemoPhoneResp = {
  name: 'customers/d9f3d10d-3831-4f40-90ab-f089c8a6ed3d/phones/97083e1a-604b-4fbe-addb-1d7f120f2287',
  createTime: '2022-07-29T03:16:04.825348Z',
  updateTime: '2022-07-29T03:16:04.825348Z',
  deleteTime: null,
  phone: '+66860000000',
};
const currentCustomer = {
  data: {
    customerPhoneNumber: [
      {
        phone: '+66897094199',
        status: 'unverified',
      },
    ],
    primaryPhoneIndex: 0,
    customerEmail: ['demo@gmail.com'],
  },
};
jest.setTimeout(100000);

describe('Testing GetConnectedLead Query API ', () => {
  test('Test GetConnectedLeadQuery API with leads', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/leads`,
        () =>
          HttpResponse.json({
            data: {
              ...DemoLeadResp,
            },
          })
      )
    );
    const { result } = renderHook(() => useLazyGetConnectedLeadsQuery({}), {
      wrapper,
    });
    const [getConnectedLead] = result.current;

    await act(async () => {
      await getConnectedLead({ leadId, currentCustomer });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(
        expect.objectContaining({
          isModal: null,
          leads: null,
        })
      );
    });
  });

  test('Test GetConnectedLeadQuery API with no leads and no similar phone numbers', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/leads`,
        () =>
          HttpResponse.json({
            leads: [],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/phones`,
        () =>
          HttpResponse.json({
            data: {
              phones: [],
            },
          })
      )
    );
    const { result } = renderHook(() => useLazyGetConnectedLeadsQuery({}), {
      wrapper,
    });
    const [getConnectedLead] = result.current;

    await act(async () => {
      await getConnectedLead({ leadId, currentCustomer });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(
        expect.objectContaining({
          leads: [],
          isModal: null,
          hasLead: false,
        })
      );
    });
  });

  test('Test GetConnectedLeadQuery API with no leads and similar phone numbers', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/leads`,
        () =>
          HttpResponse.json({
            leads: [],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/phones`,
        () =>
          HttpResponse.json({
            phones: [DemoPhoneResp],
          })
      )
    );
    const { result } = renderHook(() => useLazyGetConnectedLeadsQuery({}), {
      wrapper,
    });
    const [getConnectedLead] = result.current;

    await act(async () => {
      await getConnectedLead({ leadId, currentCustomer });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(
        expect.objectContaining({
          isModal: null,
          leads: [DemoPhoneResp],
        })
      );
    });
  });
});

const CustomerDemoResp = {
  name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda',
  createTime: '2022-03-31T04:00:34.466426Z',
  updateTime: '2022-03-31T04:00:34.466426Z',
  deleteTime: null,
  createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
  humanId: 'C56247',
  firstName: 'Piyush',
  lastName: 'Test',
  gender: 'm',
  DOB: '12/12/2022',
};

test('Test getUserFromPhoneNumber', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda`,
      async ({ request }) => HttpResponse.json(await request.json())
    )
  );
  const { result } = renderHook(() => useLazyGetUserFromPhoneNumberQuery({}), {
    wrapper,
  });
  const [getUser] = result.current;

  await act(async () => {
    await getUser({
      phones: [DemoPhoneResp],
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({
      customers: [
        {
          success: true,
        },
      ],
    });
  });
});

test('Testing createNewEmail', async () => {
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/phones`,
      () =>
        HttpResponse.json({
          data: {
            phones: '+66083940943',
          },
        })
    )
  );

  const { result } = renderHook(() => useCreatePhoneNumberMutation({}), {
    wrapper,
  });
  const [createPhone] = result.current;
  await act(async () => {
    await createPhone({ phone: '+66083940943', customerName: customerId });
  });

  const { isLoading, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { phones: '+66083940943' } });
  });
});

const demoEmails = [
  {
    name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/emails/7694c26c-8639-472f-b59e-96a01128c435',
    createTime: '2022-04-17T11:22:04.505813Z',
    updateTime: '2022-04-17T11:22:04.505813Z',
    deleteTime: null,
    email: 'asd@gmail.com',
  },
  {
    name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/emails/31c89f22-4253-4802-bdea-e2a2d8409f02',
    createTime: '2022-04-12T03:27:01.167069Z',
    updateTime: '2022-04-12T03:27:01.167069Z',
    deleteTime: null,
    email: 'asd@asd.com',
  },
  {
    name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/emails/1b42e399-1e58-40d1-89ee-6925a1c028de',
    createTime: '2022-04-11T21:14:21.751888Z',
    updateTime: '2022-04-11T21:14:21.751888Z',
    deleteTime: null,
    email: 'suthasineet@rabbit.co.th',
  },
];

test('Testing getCustomerEmail', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/emails`,
      () =>
        HttpResponse.json({
          data: {
            emails: demoEmails,
          },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetCustomerEmailQuery({}), {
    wrapper,
  });
  const [getEmail] = result.current;

  await act(async () => {
    await getEmail({
      customerId,
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ all: [], emails: [], allEmails: [] });
  });
});

test('Testing getCustomerPhoneNumber', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/phones`,
      () =>
        HttpResponse.json({
          data: {
            phones: [],
          },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetCustomerPhoneNumberQuery({}), {
    wrapper,
  });
  const [getPhoneNumber] = result.current;

  await act(async () => {
    await getPhoneNumber({ customerName: customerId });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { phones: [] } });
  });
});

test('Testing createNewEmail', async () => {
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/emails`,
      () =>
        HttpResponse.json({
          data: {
            emails: demoEmails[0].email,
          },
        })
    )
  );

  const { result } = renderHook(() => useCreateCustomerEmailMutation({}), {
    wrapper,
  });
  const [createEmail] = result.current;
  await act(async () => {
    await createEmail({ email: 'asd@gmail.com', customerName: customerId });
  });

  const { isLoading, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { emails: demoEmails[0].email } });
  });
});

test('Testing getCustomer', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}`,
      () =>
        HttpResponse.json({
          data: {
            ...CustomerDemoResp,
          },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetCustomerQuery({}), {
    wrapper,
  });
  const [getCustomer] = result.current;

  await act(async () => {
    await getCustomer(customerId);
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { ...CustomerDemoResp } });
  });
});

test('Testing getCustomerLeadById', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/leads`,
      () =>
        HttpResponse.json({
          data: {
            ...DemoLeadResp,
          },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetCustomerLeadsQuery({}), {
    wrapper,
  });
  const [getLeadById] = result.current;

  await act(async () => {
    await getLeadById(customerId);
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: DemoLeadResp });
  });
});

test('Testing createNewCustomer', async () => {
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers`,
      () =>
        HttpResponse.json({
          data: {
            ...CustomerDemoResp,
          },
        })
    )
  );
  const { result } = renderHook(() => useCreateNewCustomerMutation({}), {
    wrapper,
  });
  const [createCustomer] = result.current;

  await act(async () => {
    await createCustomer({
      firstName: CustomerDemoResp.firstName,
      lastName: CustomerDemoResp.lastName,
      createBy: CustomerDemoResp.lastName,
      dateOfBirth: CustomerDemoResp.DOB,
      gender: CustomerDemoResp.gender,
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { ...CustomerDemoResp } });
  });
});

test('Testing updateCustomer', async () => {
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}`,
      () => HttpResponse.json({ success: true })
    )
  );

  const { result } = renderHook(() => useUpdateCustomerMutation({}), {
    wrapper,
  });
  const [updateCustomer] = result.current;

  await act(async () => {
    await updateCustomer({
      customerId,
      payload: { firstName: 'value' },
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ success: true });
  });
});

test('Testing getCustomerOrders', async () => {
  const id = 'test';
  server.use(
    http.get(
      getApiEndpoint(
        `${CONSTANTS.apiEndpoint.getOrdersList}?filter=order.customer="${id}"`
      ),
      () => HttpResponse.json({ orders: MockOrderDocuments.orders })
    )
  );

  const { result } = renderHook(() => useLazyGetCustomerOrdersQuery(), {
    wrapper,
  });
  const [getCustomerOrders] = result.current;

  await act(async () => {
    await getCustomerOrders(id);
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual([
      {
        orderId: 'O57083',
        paymentStatus: 'tableListing.notFullyPaid',
        carPlate: '1ปป-2413 ปท',
        totalInvoice: 96.67,
      },
      {
        orderId: 'O57082',
        paymentStatus: 'tableListing.notFullyPaid',
        carPlate: 'กพ-9882 กท',
        totalInvoice: 96.67,
      },
      {
        orderId: 'O56923',
        paymentStatus: 'tableListing.notFullyPaid',
        carPlate: 'กพ-9882 กท',
        totalInvoice: 96.67,
      },
    ]);
  });
});

const phoneId = 'phones/abc123';

test('Testing deletePhoneNumber', async () => {
  server.use(
    http.delete(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${phoneId}`,
      () =>
        HttpResponse.json({
          data: {
            phones: '+66083940943',
          },
        })
    )
  );

  const { result } = renderHook(() => useDeletePhoneNumberMutation({}), {
    wrapper,
  });
  const [deletePhone] = result.current;
  await act(async () => {
    await deletePhone({ phone: phoneId });
  });

  const { isLoading, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { phones: '+66083940943' } });
  });
});

test('Testing getCustomerProfiles', async () => {
  server.use(
    http.get(
      getApiEndpoint(`${CONSTANTS.apiEndpoint.leadAssignment}/customers`),
      () =>
        HttpResponse.json({
          customerProfiles: [
            {
              customer: {
                name: 'customers/25e335f7-7665-4a6b-93ea-de31c39f622b',
                humanId: 'C1033767',
                firstName: 'Pactum',
                lastName: 'testing',
              },
              emails: [
                {
                  email: 'pactum@rabbit.co.th',
                },
              ],
              phones: [
                {
                  phone: '+66999999999',
                },
              ],
            },
          ],
          total: '199',
        })
    )
  );

  const { result } = renderHook(() => useLazyGetCustomerProfilesQuery(), {
    wrapper,
  });
  const [getCustomerProfiles] = result.current;
  await act(async () => {
    await getCustomerProfiles({
      listPageToken: [],
      queryParams: {},
      tableType: 'allCustomerProfile',
    });
  });

  const { isLoading, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({
      imports: [
        {
          id: 'customers/25e335f7-7665-4a6b-93ea-de31c39f622b',
          customerID: 'C1033767',
          name: 'Pactum testing',
          phoneNumber: '+66999999999',
          email: 'pactum@rabbit.co.th',
          createdOn: '',
        },
      ],
      total: '199',
    });
  });
});
