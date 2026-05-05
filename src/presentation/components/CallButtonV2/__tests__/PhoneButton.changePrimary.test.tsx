import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PhoneButton from '../PhoneButton';

jest.mock('presentation/components/modal/LeadDetailsModal/PhoneModal/useAddPhone', () => {
  const hooks = {
    setPrimaryPhoneIndex: jest.fn(),
    setPrimaryPhoneForCustomer: jest.fn(),
  };
  return {
    __esModule: true,
    default: () => ({
      ...hooks,
      status: {},
    }),
    hooks,
  };
});

jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn(() => ({
    data: { role: 'roles/admin' },
  })),
}));

jest.mock('data/slices/customerSlice', () => {
  const actual = jest.requireActual('data/slices/customerSlice');
  const mockCreatePhone = jest.fn();
  return {
    ...actual,
    useGetCustomerPhoneNumberQuery: jest.fn(),
    useCreatePhoneNumberMutation: jest.fn(() => [
      mockCreatePhone,
      { data: undefined, isLoading: false },
    ]),
    __mockCreatePhone: mockCreatePhone,
  };
});

import {
  useGetCustomerPhoneNumberQuery,
  useCreatePhoneNumberMutation,
} from 'data/slices/customerSlice';

const customerSliceMock = jest.requireMock('data/slices/customerSlice') as {
  __mockCreatePhone: jest.Mock;
};
const useAddPhoneMock = jest.requireMock(
  'presentation/components/modal/LeadDetailsModal/PhoneModal/useAddPhone'
) as {
  hooks: {
    setPrimaryPhoneIndex: jest.Mock;
    setPrimaryPhoneForCustomer: jest.Mock;
  };
};

const leadState = (phones: { phone: string; status: string }[]) => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/test-lead',
        data: {
          customerPhoneNumber: phones,
          primaryPhoneIndex: 0,
        },
      },
    },
  },
});

describe('PhoneButton handleChangePrimaryContact', () => {
  const { hooks } = useAddPhoneMock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useGetCustomerPhoneNumberQuery as jest.Mock).mockReturnValue({
      data: { phones: [] },
    });
    (useCreatePhoneNumberMutation as jest.Mock).mockReturnValue([
      customerSliceMock.__mockCreatePhone,
      { data: undefined, isLoading: false },
    ]);
  });

  it('creates customer phone and sets primary index when number is not on customer', async () => {
    (useGetCustomerPhoneNumberQuery as jest.Mock).mockReturnValue({
      data: {
        phones: [{ phone: '+66111111111', name: 'customers/x/phones/a' }],
      },
    });

    render(
      <PhoneButton
        customerId="customers/test"
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="idle"
      />,
      {
        initialState: leadState([
          { phone: '+66111111111', status: 'verify' },
          { phone: '+66222222222', status: 'verify' },
        ]),
      }
    );

    await userEvent.click(screen.getByTestId('phone-menu-btn'));
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]);

    expect(customerSliceMock.__mockCreatePhone).toHaveBeenCalledWith({
      phone: '+66222222222',
      customerName: 'customers/test',
    });
    expect(hooks.setPrimaryPhoneIndex).toHaveBeenCalledWith(1);
    expect(hooks.setPrimaryPhoneForCustomer).not.toHaveBeenCalled();
  });

  it('sets primary on customer when number already exists and customerId is set', async () => {
    (useGetCustomerPhoneNumberQuery as jest.Mock).mockReturnValue({
      data: {
        phones: [
          { phone: '+66111111111', name: 'customers/x/phones/a' },
          { phone: '+66222222222', name: 'customers/x/phones/b' },
        ],
      },
    });

    render(
      <PhoneButton
        customerId="customers/test"
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="idle"
      />,
      {
        initialState: leadState([
          { phone: '+66111111111', status: 'verify' },
          { phone: '+66222222222', status: 'verify' },
        ]),
      }
    );

    await userEvent.click(screen.getByTestId('phone-menu-btn'));
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]);

    expect(customerSliceMock.__mockCreatePhone).not.toHaveBeenCalled();
    expect(hooks.setPrimaryPhoneForCustomer).toHaveBeenCalledWith(
      '66222222222',
      'customers/test'
    );
    expect(hooks.setPrimaryPhoneIndex).toHaveBeenCalledWith(1);
  });

  it('only updates lead primary index when number exists on customer but customerId is missing', async () => {
    (useGetCustomerPhoneNumberQuery as jest.Mock).mockReturnValue({
      data: {
        phones: [{ phone: '+66111111111', name: 'customers/x/phones/a' }],
      },
    });

    render(
      <PhoneButton startCall={jest.fn()} endCall={jest.fn()} callState="idle" />,
      {
        initialState: leadState([
          { phone: '+66111111111', status: 'verify' },
          { phone: '+66222222222', status: 'verify' },
        ]),
      }
    );

    await userEvent.click(screen.getByTestId('phone-menu-btn'));
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]);

    expect(hooks.setPrimaryPhoneForCustomer).not.toHaveBeenCalled();
    expect(hooks.setPrimaryPhoneIndex).toHaveBeenCalledWith(0);
  });
});
