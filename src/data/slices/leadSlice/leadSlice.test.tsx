import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import LeadDetail from 'mock-data/LeadDetail.mock';

import { apiSlice } from '../apiSlice';

import {
  useConnectLeadToCustomerMutation,
  useUpdateLeadMutation,
  useLazyGetLeadByIDQuery,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const leadId = 'leads/9aca2b1f-e85e-4b9a-8f13-e7e53f2aa211';
const customerId = 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda';

jest.setTimeout(100000);

test('Test ConnectLeadToCustomer API', async () => {
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/leads`,
      () =>
        HttpResponse.json({
          data: {},
        })
    )
  );
  const { result } = renderHook(() => useConnectLeadToCustomerMutation({}), {
    wrapper,
  });
  const [connectedLead] = result.current;

  await act(async () => {
    await connectedLead({ customerId, lead: leadId });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(expect.objectContaining({}));
  });
});

test('Test updateLead', async () => {
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/${leadId}`,
      () =>
        HttpResponse.json({
          data: { ...LeadDetail },
        })
    )
  );
  const { result } = renderHook(() => useUpdateLeadMutation({}), {
    wrapper,
  });
  const [updateLead] = result.current;

  await act(async () => {
    await updateLead({
      leadId,
      data: { ...LeadDetail },
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { ...LeadDetail } });
  });
});
test('Testing getLeadById', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/${leadId}`,
      () =>
        HttpResponse.json({
          data: { ...LeadDetail },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetLeadByIDQuery({}), {
    wrapper,
  });
  const [getLeadById] = result.current;

  await act(async () => {
    await getLeadById(leadId.split('/')[1]);
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ data: { ...LeadDetail } });
  });
});
