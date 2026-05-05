import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { of } from 'rxjs';

import { render, screen } from '__tests__/rtl-test-utils';
import mockTransactionsSnapshot from 'mock-data/TransactionFee.mock';
import GetAddressHelper from 'shared/helper/getAddress';
import { getMockOrder, getMockOrderCompany } from 'shared/helper/OrderMockData';

import ShippingInfo from '.';

jest.mock('data/slices/transactionSlice', () => ({
  useGetTransactionFeeQuery: jest.fn((options) => ({
    data: mockTransactionsSnapshot,
    error: undefined,
    ...options,
  })),
}));
const mockStore = configureMockStore();
it('Render ShippingInfo editable content', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  const store = mockStore(initialState);
  const props = {
    isEditable: true,
    orderId: '81bcb399-803e-4512-90dd-1c741a0e1e40',
    policyId: '253fc8d0-9dfa-428a-968e-2e561273f6aa',
    shippingInfoData: {
      hasMultiplePolicies: true,
      insuranceCategory: 'VOLUNTARY',
      paymentType: 'Credit card installment',
      policy: {
        policyNumber: '121201910',
        trackingNumber: 'xxx-1212',
      },
      order: {
        data: {
          shipmentFee: 499,
          policyHolder: {
            shippingAddress: {
              phoneNumber: '0291092012',
              fullName: 'Piyush Full Name',
            },
          },
        },
      },
    },
    showShipmentFee: true,
  };
  render(
    <Provider store={store as any}>
      <ShippingInfo {...props} />
    </Provider>
  );
  const textboxes = screen.getAllByRole('textbox');

  await waitFor(() => {
    expect(
      screen.getByTestId('shipping-mandatory-policy-num-input')
    ).toBeTruthy();
  });
  await waitFor(() => {
    expect(textboxes).toBeTruthy();
  });
  const shipmentField = screen.getByTestId('shipment-fee-input');
  expect(shipmentField).toBeInTheDocument();
  expect(shipmentField).toHaveValue('0');
});

it('Render ShippingInfo component', async () => {
  interface IAddress {
    name: string;
    nameEn: string;
    nameTh: string;
  }

  const address: IAddress[] = [
    {
      name: 'provinces/100000',
      nameEn: 'Bangkok',
      nameTh: 'กรุงเทพมหานคร',
    },
    {
      name: 'provinces/100000/districts/100100',
      nameEn: 'Phra Nakhon',
      nameTh: 'กรุงเทพมหานคร',
    },
    {
      name: 'provinces/100000/districts/100100/subdistricts/100101',
      nameEn: 'Phra Borom Maha Ratchawang',
      nameTh: 'กรุงเทพมหานคร',
    },
  ];

  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  const store = mockStore(initialState);
  const props = {
    shippingInfoData: {
      hasMultiplePolicies: true,
      insuranceCategory: 'VOLUNTARY',
      paymentType: 'Credit card installment',
      policy: {
        policyNumber: '121201910',
        trackingNumber: 'xxx-1212',
      },
      order: {
        isFullyPaid: true,
        data: {
          policyHolder: {
            shippingAddress: {
              addressType: 'personal',
              phoneNumber: '0291092012',
              fullName: 'Piyush Full Name',
            },
          },
        },
      },
    },
  };
  const spygetAddress = jest
    .spyOn(GetAddressHelper, 'getAddressForkJoin')
    .mockReturnValue(of(address));
  render(
    <Provider store={store as any}>
      <ShippingInfo {...props} />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByTestId('shipping-tracking-num-input')).toBeDisabled();
  });
  expect(spygetAddress).toHaveBeenCalled();
});

it('Render ShippingInfo component for company policy holder', () => {
  const initialState = {
    order: {
      payload: getMockOrderCompany(),
    },
  };
  const store = mockStore(initialState);
  const props = {
    shippingInfoData: {
      hasMultiplePolicies: null,
      insuranceCategory: 'MANDATORY',
      paymentType: 'Credit card installment',
      policy: {
        policyNumber: '121201910',
        trackingNumber: '',
      },
      order: {
        isFullyPaid: false,
        isUrgentDelivery: null,
        data: {
          policyHolder: {
            shippingAddress: {
              phoneNumber: '',
              address: 'home',
              addressType: 'company',
              district: 100600,
              companyName: 'Piyush Full Name',
              postCode: 10240,
              province: 100000,
              subDistrict: 100608,
            },
          },
        },
      },
    },
  };
  render(
    <Provider store={store as any}>
      <ShippingInfo {...props} />
    </Provider>
  );
  expect(screen.getByText('text.shippingInfo')).toBeTruthy();
});

jest.mock('data/slices/orderPolicySlice', () => ({
  useUpdatePolicyMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

it('ShippingInfo component handle update policy', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  const store = mockStore(initialState);
  const props = {
    isEditable: true,
    orderId: '81bcb399-803e-4512-90dd-1c741a0e1e40',
    policyId: '253fc8d0-9dfa-428a-968e-2e561273f6aa',
    shippingInfoData: {
      hasMultiplePolicies: true,
      insuranceCategory: 'VOLUNTARY',
      paymentType: 'Credit card installment',
      policy: {
        name: 'orders/81bcb399-803e-4512-90dd-1c741a0e1e40/items/253fc8d0-9dfa-428a-968e-2e561273f6aa',
        policyNumber: '121201910',
        trackingNumber: 'xxx-1212',
      },
      order: {
        data: {
          policyHolder: {
            shippingAddress: {
              phoneNumber: '0291092012',
              fullName: 'Piyush Full Name',
            },
          },
        },
      },
    },
  };

  render(
    <Provider store={store as any}>
      <ShippingInfo {...props} />
    </Provider>
  );
  const policyNumInput = screen.getByTestId(
    'shipping-mandatory-policy-num-input'
  );
  userEvent.type(policyNumInput, '1212019102222');
  userEvent.tab();
  expect(screen.getByTestId('shipping-mandatory-policy-num-input')).toHaveValue(
    '121201910'
  );
});
