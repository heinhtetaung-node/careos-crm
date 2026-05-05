import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';

import { server } from '__mocks__/server';
import { render, screen } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { store } from 'presentation/redux/store';
import useGetShipmentData from 'presentation/hooks/useGetShipmentData';

import PrintingAndShippingOrderDetailPage from '.';

var mockedUseParams: jest.Mock;

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: mockedUseParams,
  };
});

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest
    .fn()
    .mockReturnValue({ data: { role: 'roles/shipment-agent' } }),
}));

jest.mock('presentation/hooks/useGetShipmentData');

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const dispatch = jest.fn();
(useDispatch as any).mockReturnValue(dispatch);

test('PrintingAndShippingOrderDetailPage Component has error', async () => {
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
      () => HttpResponse.json({ error: 'not found' }, { status: 500 })
    )
  );
  mockedUseParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <PrintingAndShippingOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test('PrintingAndShippingOrderDetailPage Component fail by wrong data', async () => {
  const wrongData = {
    ...OrderDetail,
    car: {},
  };
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
      () => HttpResponse.json(wrongData)
    )
  );
  mockedUseParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <PrintingAndShippingOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test.skip('PrintingAndShippingOrderDetailPage Component loads', async () => {
  mockedUseParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <PrintingAndShippingOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});

test('PrintingAndShippingOrderDetailPage Component no orderId or policy Id', async () => {
  mockedUseParams.mockReturnValue({
    orderId: '',
    policyId: '',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <PrintingAndShippingOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test('PrintingAndShippingOrderDetailPage Component successfully gets orderPolicy data', async () => {
  (useGetShipmentData as jest.Mock).mockImplementation(() => ({
    deliveredByCourier: {
      shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
      statusUpdateTime: '2023-02-24T03:37:21.741289Z',
    },
    trackingNumber: 'RABL098973551',
  }));
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
      () => HttpResponse.json(OrderDetail)
    )
  );
  mockedUseParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <PrintingAndShippingOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByTestId('printing-and-shipping-order')).toBeTruthy();
  });
  expect(screen.getByTestId('order-id')).toBeInTheDocument();
});
