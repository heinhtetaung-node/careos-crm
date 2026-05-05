import userEvent from '@testing-library/user-event';
import React from 'react';
import * as ReactRedux from 'react-redux';

import { getCustomerPhonesHandler } from '__mocks__/handlers/customerHandler';
import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import OrderPhoneModal from '.';

const customerId = 'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f';
const close = jest.fn();

var mockShowError: jest.Mock;
var mockShowSuccess: jest.Mock;
var mockUseUpdateCustomerMutation: jest.Mock;
var mockUseCreatePhoneNumberMutation: jest.Mock;
var mockAddPhoneToCustomer: jest.Mock;
var mockRefetchCustomerPhones: jest.Mock;

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  mockShowSuccess = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: mockShowSuccess,
  });
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('data/slices/customerSlice', () => {
  mockUseUpdateCustomerMutation = jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      data: {},
      isLoading: false,
    },
  ]);
  mockAddPhoneToCustomer = jest.fn().mockImplementation(() => ({
    unwrap: () => Promise.resolve({ name: 'customers/x/phones/new-id' }),
  }));
  mockUseCreatePhoneNumberMutation = jest.fn().mockReturnValue([
    mockAddPhoneToCustomer,
    {
      isLoading: false,
      isSuccess: true,
    },
  ]);
  mockRefetchCustomerPhones = jest.fn().mockResolvedValue({
    data: { phones: [{ phone: '+66799999999', name: 'customers/x/phones/1' }] },
  });
  return {
    ...jest.requireActual('data/slices/customerSlice'),
    useUpdateCustomerMutation: mockUseUpdateCustomerMutation,
    useCreatePhoneNumberMutation: mockUseCreatePhoneNumberMutation,
    useGetCustomerPhoneNumberQuery: jest.fn().mockReturnValue({
      data: { phones: [] },
      refetch: mockRefetchCustomerPhones,
    }),
  };
});

const mockUseGetLeadByIDQuery = jest.fn().mockReturnValue({
  data: {
    data: {
      customerPhoneNumber: [
        { phone: '+6622222222', status: 'unverified' },
      ],
    },
  },
  isLoading: false,
  isSuccess: true,
  refetch: jest.fn(),
});
jest.mock('data/slices/leadSlice', () => ({
  ...jest.requireActual('data/slices/leadSlice'),
  useGetLeadByIDQuery: (...args: unknown[]) => mockUseGetLeadByIDQuery(...args),
}));

let mockUpdateLeadUnwrapResult: Promise<{
  data?: {
    customerPhoneNumber?: unknown[];
    customer?: { phoneNumbers?: unknown[] };
  };
}> = Promise.resolve({
  data: {
    customerPhoneNumber: [
      { phone: '+66799999999' },
      { phone: '+66788888888' },
    ],
  },
});
jest.mock('data/slices/leadDetailSlices/updateLeadSlice', () => ({
  useUpdateLeadJsonMutation: jest.fn().mockReturnValue([
    jest.fn().mockImplementation(() => ({
      unwrap: () => mockUpdateLeadUnwrapResult,
    })),
    { isLoading: false, isSuccess: true, isError: false },
  ]),
}));

const dispatch = jest.fn();
(ReactRedux.useDispatch as any).mockReturnValue(dispatch);

const initialState = { order: { payload: OrderDetail.order } };

describe('OrderPhoneModal handleSubmit coverage (lines 134-136, 143, 146, 150-152, 193-194)', () => {
  beforeEach(() => {
    mockRefetchCustomerPhones?.mockResolvedValue?.({
      data: {
        phones: [{ phone: '+66799999999', name: 'customers/x/phones/1' }],
      },
    });
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        data: {
          customerPhoneNumber: [{ phone: '+6622222222', status: 'unverified' }],
        },
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    });
    mockUpdateLeadUnwrapResult = Promise.resolve({
      data: {
        customerPhoneNumber: [
          { phone: '+66799999999' },
          { phone: '+66788888888' },
        ],
      },
    });
    mockShowError.mockClear();
    mockShowSuccess.mockClear();
    mockAddPhoneToCustomer?.mockClear?.();
  });

  it('covers 134-136 and 143: uses leadData.data.customer.phoneNumbers as phonesFromLead', async () => {
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        data: {
          customer: {
            phoneNumbers: [
              { phone: '+66123456789', status: 'unverified' },
            ],
          },
        },
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.type(await screen.findByRole('textbox'), '0987654321');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  it('covers 134-136 fallback: phonesFromLead is [] when leadData.data.customer is undefined', async () => {
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        data: {},
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.type(await screen.findByRole('textbox'), '0999999999');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  it('covers 150: uses existing customer phone id when phone already exists in customer', async () => {
    const existingPhoneName = 'customers/abc/phones/existing-id';
    const phoneToAdd = '0812345678';
    const internationalPhone = '+66812345678';
    mockRefetchCustomerPhones.mockResolvedValueOnce({
      data: {
        phones: [{ name: existingPhoneName, phone: internationalPhone }],
      },
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.type(await screen.findByRole('textbox'), phoneToAdd);
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(close).toHaveBeenCalled();
    });
    expect(mockAddPhoneToCustomer).not.toHaveBeenCalled();
  });

  it('covers 151-152: calls addPhoneToCustomer when phone does not exist in customer', async () => {
    const phoneToAdd = '0823456789';
    const internationalPhone = '+66823456789';
    mockRefetchCustomerPhones.mockResolvedValueOnce({
      data: {
        phones: [{ phone: '+66799999999', name: 'customers/x/phones/other' }],
      },
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.type(await screen.findByRole('textbox'), phoneToAdd);
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(close).toHaveBeenCalled();
    });
    expect(mockAddPhoneToCustomer).toHaveBeenCalledWith({
      customerName: customerId,
      phone: internationalPhone,
    });
  });

  it('covers 146, 193, 194: health product uses phonesFromLeadHealth and primaryPhoneIndex from customer.phoneNumbers', async () => {
    const healthState = {
      ...initialState,
      typeSelectorReducer: {
        globalProductSelectorReducer: { data: 'products/health-insurance' },
      },
    };
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        data: {
          customer: {
            phoneNumbers: [{ phone: '+66111111111', status: 'unverified' }],
          },
        },
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    });
    mockUpdateLeadUnwrapResult = Promise.resolve({
      data: {
        customer: {
          phoneNumbers: [
            { phone: '+66111111111', status: 'unverified' },
            { phone: '+66822222222', status: 'unverified' },
          ],
        },
      },
    });
    mockRefetchCustomerPhones.mockResolvedValue({
      data: {
        phones: [{ phone: '+66799999999', name: 'customers/x/phones/1' }],
      },
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState: healthState,
    });

    await userEvent.type(await screen.findByRole('textbox'), '0822222222');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  it('covers line 194: car product uses primaryPhoneIndex from leadUpdatedData.customerPhoneNumber', async () => {
    const carState = {
      ...initialState,
      typeSelectorReducer: {
        globalProductSelectorReducer: { data: 'products/car-insurance' },
      },
    };

    // Lead has customerPhoneNumber (car shape) but not the new phone
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        data: {
          customerPhoneNumber: [{ phone: '+6622222222', status: 'unverified' }],
        },
      },
      isLoading: false,
      isSuccess: true,
      refetch: jest.fn(),
    });

    // Update lead returns customerPhoneNumber so ternary car-branch (line 194) runs
    mockUpdateLeadUnwrapResult = Promise.resolve({
      data: {
        customerPhoneNumber: [
          { phone: '+6622222222', status: 'unverified' },
          { phone: '+66833333333', status: 'unverified' },
        ],
      },
    });

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState: carState,
    });

    await userEvent.type(await screen.findByRole('textbox'), '0833333333');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });
});

describe.skip('Test <OrderPhoneModal />', () => {
  beforeEach(() => {
    const mockPhonesResponse = {
      phones: [
        {
          name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/5ea05a26-0ab4-45f8-a380-89f5679e5f9d',
          createTime: '2023-03-19T12:47:27.803273Z',
          updateTime: '2023-03-19T12:47:27.803273Z',
          deleteTime: null,
          phone: '+66999999999',
        },
      ],
      nextPageToken: '',
    };
    server.use(getCustomerPhonesHandler(mockPhonesResponse, customerId));

    mockShowError.mockClear();
    mockShowSuccess.mockClear();
    mockUseUpdateCustomerMutation.mockClear();
    mockUseCreatePhoneNumberMutation.mockClear();
  });

  test('Should open add phone modal successfully', async () => {
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });
    expect(await screen.findByTestId('order-add-phone')).toBeInTheDocument();
  });

  test('Should disable the submit button when phone is invalid', async () => {
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });
    await userEvent.type(await screen.findByRole('textbox'), '08');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'text.addButton' })
      ).toBeDisabled()
    );
  });

  test('Should add phone number success', async () => {
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.type(await screen.findByRole('textbox'), '0999999999');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  test('Should add phone number success with main contact', async () => {
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.click(
      await screen.findByTestId('checkbox-text.mainContact')
    );
    await userEvent.type(screen.getByRole('textbox'), '0999999999');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  test('Should take exists phone instead of adding it', async () => {
    const mockPhonesResponse = {
      phones: [
        {
          name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/5ea05a26-0ab4-45f8-a380-89f5679e5f9d',
          createTime: '2023-03-19T12:47:27.803273Z',
          updateTime: '2023-03-19T12:47:27.803273Z',
          deleteTime: null,
          phone: '+66999999999',
        },
      ],
      nextPageToken: '',
    };
    server.use(getCustomerPhonesHandler(mockPhonesResponse, customerId));

    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.click(
      await screen.findByTestId('checkbox-text.mainContact')
    );
    await userEvent.type(screen.getByRole('textbox'), '0999999999');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockUseCreatePhoneNumberMutation).toHaveBeenCalledTimes(3);
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  test('Should add phone number fail with main contact', async () => {
    mockUseUpdateCustomerMutation.mockReturnValue([
      jest.fn(),
      {
        isSuccess: false,
        isError: true,
        data: {},
        isLoading: false,
      },
    ]);
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.click(
      await screen.findByTestId('checkbox-text.mainContact')
    );
    await userEvent.type(screen.getByRole('textbox'), '0999999999');
    await userEvent.click(
      screen.getByRole('button', { name: 'text.addButton' })
    );

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
    });
  });

  test('should button display loading state when API calling in progress', async () => {
    mockUseCreatePhoneNumberMutation.mockReturnValue([
      jest.fn(),
      {
        isLoading: true,
        isSuccess: false,
      },
    ]);
    mockUseUpdateCustomerMutation.mockReturnValue([
      jest.fn(),
      {
        isSuccess: false,
        isError: false,
        isLoading: true,
      },
    ]);
    render(<OrderPhoneModal customerId={customerId} close={close} />, {
      initialState,
    });

    await userEvent.click(
      await screen.findByTestId('checkbox-text.mainContact')
    );
    expect(screen.getByRole('button', { name: 'text.loading' })).toBeDisabled();
  });
});
