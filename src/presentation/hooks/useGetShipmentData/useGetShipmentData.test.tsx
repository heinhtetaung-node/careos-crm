import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { setupApiStore } from '__tests__/rtl-store';
import { apiSlice } from 'data/slices/apiSlice';
import { store } from 'presentation/redux/store';

import useGetShipmentData from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
);

jest.mock(
  'presentation/pages/car-insurance/orders/PrintingAndShipping/PolicySearchSlice',
  () => ({
    useGetShipmentsQuery: jest.fn().mockReturnValue({
      data: {
        'orders/123/items/1234': {
          deliveredByCourier: {
            shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
            statusUpdateTime: '2023-02-24T03:37:21.741289Z',
          },
          trackingNumber: 'RABL098973551',
        },
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    }),
  })
);

test('Test useGetShipmentData should return the document types, uploaded documents and policyname', async () => {
  const { result } = renderHook(
    () =>
      useGetShipmentData({
        orderId: '123',
        policyId: 'orders/123/items/1234',
      }),
    {
      wrapper,
    }
  );
  await waitFor(() => {
    expect(result.current).toMatchObject({
      deliveredByCourier: {
        shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
        statusUpdateTime: '2023-02-24T03:37:21.741289Z',
      },
      trackingNumber: 'RABL098973551',
    });
  });
});

test('Test useGetShipmentData finds no shipment data', async () => {
  const { result } = renderHook(
    () =>
      useGetShipmentData({
        orderId: '123',
        policyId: 'orders/123/items/545',
      }),
    {
      wrapper,
    }
  );
  await waitFor(() => {
    expect(result.current).toBeFalsy();
  });
});
