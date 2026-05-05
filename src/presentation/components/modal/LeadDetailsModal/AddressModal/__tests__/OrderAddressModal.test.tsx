import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';

import AddressModal from '..';

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({
    'com-189_enable-policyholder-info_20220620_temp': { enabled: true },
  }),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test.skip('Address Modal renders and shows all required inputs for Order page', async () => {
  render(<AddressModal close={jest.fn()} leadId="leadId" />);
  // Same Shipment address
  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[0]
  ).toHaveAttribute('checked', '');

  // Same Billing address
  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[1]
  ).toHaveAttribute('checked', '');
});

test.skip('updateOrder should call in formik submit. if we are coming from ORDER', async () => {
  render(<AddressModal close={jest.fn()} leadId="leadId" />);
  const notSameCheckbox = screen.getAllByTestId(
    'checkbox-addressModal.samePolicyAddress'
  )[0];

  await userEvent.click(notSameCheckbox);

  const submitBtn = screen.getByTestId('add-address-submit-btn');

  expect(submitBtn).toHaveTextContent('text.addButton');

  await userEvent.click(submitBtn);

  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/607527f2-016b-4458-96f9-162f767278d5:patchData`,
      () => HttpResponse.json({ success: true })
    )
  );

  const { result } = renderHook(() => useUpdateOrderDataMutation({}), {
    wrapper,
  });
  const [updateOrderData] = result.current;

  await act(async () => {
    await updateOrderData({
      orderId: '607527f2-016b-4458-96f9-162f767278d5',
      payload: [
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/isBillingAddress',
          value: true,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/isShippingAddress',
          value: true,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/addressType',
          value: 'personal',
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/address',
          value: 'Test',
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/province',
          value: 100000,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/district',
          value: 100200,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/postCode',
          value: 10300,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/subDistrict',
          value: 100202,
        },
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/fullName',
          value: 'Cypress TestQA',
        },
      ],
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual({ success: true });
  });
});
