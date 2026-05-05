import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { apiSlice } from 'data/slices/apiSlice';
import { MockDeliveryOptions } from 'mock-data/DeliveryOptions.mock';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import useAddress from './useAddress';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('should useAddress hook return correct deliveryOptionPreferred', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/deliveryOptions`,
      () => HttpResponse.json(MockDeliveryOptions)
    )
  );

  const { result, waitForNextUpdate } = renderHook(
    () => useAddress(OrderDetail as any, false),
    {
      wrapper,
    }
  );

  await waitForNextUpdate();

  expect((result.current as any)?.deliveryOptionPreferred).not.toBe('-');
  expect(result.current).toMatchObject({
    addressPolicyHolder:
      'Test Address updated, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200',
    addressBilling: '-',
    addressShipping: 'qc.usePolicyAddress',
    deliveryOptionPreferred: 'qc.kerryStandard',
  });
});
