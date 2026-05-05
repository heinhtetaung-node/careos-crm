import { act, waitFor, renderHook } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { apiSlice } from '../apiSlice';

import { useUpdatePolicyDataMutation, useUpdatePolicyMutation } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('orderPolicySlice updateMutation', async () => {
  const updatePolicyResponse = {
    name: 'orders/986a8bb1-e1af-432b-933b-a70c965a347f/items/1bcd5ada-84d0-43ca-b6ee-a7cb4e4dad05',
    createTime: '2022-09-02T10:11:41.805041Z',
    updateTime: '2022-09-08T04:49:14.229387Z',
    humanId: 'L9873192-2',
    policyNumber: '999999',
    printingAndShippingStatus: 'POLICY_NOT_READY',
  };
  const params = {
    orderId: '986a8bb1-e1af-432b-933b-a70c965a347f',
    policyId: 'L9873192-2',
  };
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/${params.orderId}/items/${params.policyId}`,
      () => HttpResponse.json(updatePolicyResponse)
    )
  );
  const { result } = renderHook(() => useUpdatePolicyMutation({}), {
    wrapper,
  });
  const [updatePolicy] = result.current;

  await act(async () => {
    await updatePolicy({
      ...params,
      policyNumber: '999999',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(updatePolicyResponse);
  });
});

test('orderPolicySlice updateMutation', async () => {
  const updatePolicyResponse = {
    name: 'orders/986a8bb1-e1af-432b-933b-a70c965a347f/items/1bcd5ada-84d0-43ca-b6ee-a7cb4e4dad05',
    createTime: '2022-09-02T10:11:41.805041Z',
    updateTime: '2022-09-08T04:49:14.229387Z',
    humanId: 'L9873192-2',
    policyNumber: '999999',
    printingAndShippingStatus: 'POLICY_NOT_READY',
  };
  const params = {
    orderId: '986a8bb1-e1af-432b-933b-a70c965a347f',
    policyId: 'L9873192-2',
  };
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/${params.orderId}/items/${params.policyId}`,
      () => HttpResponse.json(updatePolicyResponse)
    )
  );
  const { result } = renderHook(() => useUpdatePolicyMutation({}), {
    wrapper,
  });
  const [updatePolicy] = result.current;

  await act(async () => {
    await updatePolicy({
      ...params,
      policyNumber: '999999',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(updatePolicyResponse);
  });
});

test('orderPolicySlice useUpdatePolicyDataMutation', async () => {
  const updatePolicyResponse = {
    name: 'orders/986a8bb1-e1af-432b-933b-a70c965a347f/items/1bcd5ada-84d0-43ca-b6ee-a7cb4e4dad05',
    policyStartDate: '10/10/2023',
  };
  const params = {
    orderId: '986a8bb1-e1af-432b-933b-a70c965a347f',
    policyId: 'L9873192-2',
  };
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/${params.orderId}/items/${params.policyId}`,
      () => HttpResponse.json(updatePolicyResponse)
    )
  );
  const { result } = renderHook(() => useUpdatePolicyDataMutation({}), {
    wrapper,
  });
  const [updatePolicy] = result.current;

  await act(async () => {
    await updatePolicy({
      ...params,
      policyStartDate: '10/10/2023',
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(updatePolicyResponse);
  });
});
