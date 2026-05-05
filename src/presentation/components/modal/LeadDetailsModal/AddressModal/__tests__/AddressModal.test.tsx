import userEvent from '@testing-library/user-event';
import React from 'react';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import AddressModal from '..';
import * as addressHelper from '../helper';

jest.mock('../helper', () => {
  const actual = jest.requireActual('../helper');
  return {
    ...actual,
    formatOrderAddressPayload: jest.fn((values: any, product?: string) =>
      actual.formatOrderAddressPayload(values, product)
    ),
  };
});

jest.mock('presentation/components/LeadDetails/SubDistrictSelector');
jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({
    'com-189_enable-policyholder-info_20220620_temp': { enabled: true },
  }),
}));

let mockOrderId: string | undefined;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: mockOrderId }),
}));

const mockUpdateOrder = jest.fn().mockResolvedValue({});

jest.mock('data/slices/orderSlice', () => {
  const actual = jest.requireActual('data/slices/orderSlice');
  return {
    ...actual,
    useUpdateOrderDataMutation: () => [
      mockUpdateOrder,
      {
        isSuccess: false,
        isLoading: false,
        isError: false,
        reset: jest.fn(),
      },
    ],
  };
});

beforeEach(() => {
  mockOrderId = undefined;
});

test('renders and shows all required inputs', () => {
  render(<AddressModal close={jest.fn()} leadId="leadId" />);

  // Same Shipment address
  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[0]
  ).toBeChecked();

  // Same Billing address
  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[1]
  ).toBeChecked();

  expect(screen.getByTestId('add-address-submit-btn')).toHaveTextContent(
    'text.addButton'
  );
});

// data-testid were missing in the component since long time ago
test.skip('Name, province fields are visible after changing address type to personal', async () => {
  render(<AddressModal close={jest.fn()} leadId="leadId" />);

  expect(screen.queryByTestId('policy.firstName')).not.toBeInTheDocument();

  fireEvent.change(screen.getByTestId('select-policy.addressType'), {
    target: { value: 'personal' },
  });

  const provinceAutocomplete = screen.getByTestId('policy.province');
  const districtAutocomplete = screen.getByTestId('policy.district');
  const subDistrictAutocomplete = screen.getByTestId('policy.subDistrict');

  expect(screen.getByTestId('policy.first-name')).toBeInTheDocument();
  expect(provinceAutocomplete).toBeInTheDocument();
  expect(districtAutocomplete).toBeInTheDocument();
  expect(subDistrictAutocomplete).toBeInTheDocument();

  // Select Sub District Dusit
  fireEvent.change(screen.getByTestId('policy.subDistrict'), {
    target: {
      value: 'provinces/100000/districts/100200/subdistricts/100201',
    },
  });
});

test('uncheck is same address checkbox', async () => {
  render(<AddressModal close={jest.fn()} leadId="leadId" />);

  // Click on is same Shipment address
  await userEvent.click(
    screen.queryAllByLabelText('addressModal.samePolicyAddress')[0]
  );

  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[0]
  ).not.toBeChecked();

  expect(screen.getByTestId('select-shipping.addressType')).toBeInTheDocument();

  // Click on is same Billing address
  await userEvent.click(
    screen.queryAllByLabelText('addressModal.samePolicyAddress')[1]
  );

  expect(
    screen.getAllByTestId('checkbox-addressModal.samePolicyAddress')[1]
  ).not.toBeChecked();

  expect(screen.getByTestId('select-billing.addressType')).toBeInTheDocument();
});

describe('AddressModal order detail submit', () => {
  beforeEach(() => {
    mockOrderId = '607527f2-016b-4458-96f9-162f767278d5';
    mockUpdateOrder.mockClear();
    (addressHelper.formatOrderAddressPayload as jest.Mock).mockClear();
  });

  it('passes order product into formatOrderAddressPayload when saving from order context', async () => {
    render(<AddressModal close={jest.fn()} leadId="leadId" />, {
      initialState: {
        order: {
          payload: OrderDetail.order,
          isFetching: false,
          error: null,
          success: true,
        },
      },
    });

    const policyAddressInput = document.querySelector(
      'input[name="policy.address"]'
    ) as HTMLInputElement;
    expect(policyAddressInput).toBeTruthy();
    await userEvent.clear(policyAddressInput);
    await userEvent.type(
      policyAddressInput,
      `${OrderDetail.order.data.policyHolder.policyAddress.address} edited`
    );

    await userEvent.click(screen.getByTestId('add-address-submit-btn'));

    expect(addressHelper.formatOrderAddressPayload).toHaveBeenCalledWith(
      expect.any(Object),
      OrderDetail.order.product
    );
    expect(mockUpdateOrder).toHaveBeenCalled();
  });
});
