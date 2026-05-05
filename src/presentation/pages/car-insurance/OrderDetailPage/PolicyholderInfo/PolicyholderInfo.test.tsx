import user from '@testing-library/user-event';
import React from 'react';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '__tests__/rtl-test-utils';
import { getMockOrder } from 'shared/helper/OrderMockData';

import PolicyholderInfo, { getFormattedOrder } from '.';

var mockShowError: jest.Mock;
var mockShowSuccess: jest.Mock;
var mockUpdateOrderResponse: jest.Mock;
var mockUpdateLead: jest.Mock;

jest.mock('../../LeadDetailsPage/leadUpdater', () => {
  mockUpdateLead = jest.fn();
  return () => ({ updateLead: mockUpdateLead });
});

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  mockShowSuccess = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: mockShowSuccess,
  });
});

jest.mock('data/slices/orderSlice', () => {
  mockUpdateOrderResponse = jest.fn().mockReturnValue([
    jest.fn().mockResolvedValue({}),
    {
      isSuccess: true,
      data: {},
      isLoading: false,
    },
  ]);
  return {
    ...jest.requireActual('data/slices/orderSlice'),
    useUpdateOrderDataMutation: mockUpdateOrderResponse,
  };
});

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/RenderDOB',
  () => ({
    __esModule: true,
    default: ({ onClose }: { onClose: (value: Date) => void }) => (
      <button
        data-testid="mock-dob"
        aria-label="mock date of birth"
        onClick={() => onClose(new Date('1990-01-02'))}
        type="button"
      />
    ),
  })
);

test('PolicyholderInfo renders', () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });
  expect(screen.getByText('text.policyHolderInformation')).toBeInTheDocument();
});

test('PolicyholderInfo renders fields for company', () => {
  const companyPolicyHolder = getMockOrder();
  companyPolicyHolder.data.policyHolder.isCompany = true;
  const initialState = {
    order: {
      payload: companyPolicyHolder,
    },
  };
  render(<PolicyholderInfo />, { initialState });
  expect(screen.getByText('text.policyHolderInformation')).toBeInTheDocument();
});

test.skip('PolicyholderInfo handles policyholder change & prevent missing fields', async () => {
  const mockOrderData = getMockOrder();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, gender, ...isNotPolicyholder } =
    mockOrderData.data.policyHolder;
  isNotPolicyholder.isCompany = true;
  const newMockOrderData = {
    ...mockOrderData,
    data: {
      ...mockOrderData.data,
      policyHolder: isNotPolicyholder,
    },
  };
  const initialState = {
    order: {
      payload: newMockOrderData,
    },
  };
  render(<PolicyholderInfo />, { initialState });

  const radio = screen.getAllByRole('radio')[1];
  await user.click(radio);

  const firstName = screen.getAllByRole('textbox')[0];
  await user.clear(firstName);
  await user.type(firstName, 'Testname');
  await user.tab();

  const documentId = screen.getAllByRole('textbox')[3];
  await user.clear(documentId);
  await user.type(documentId, '123456785678');

  await waitFor(() => {
    expect(screen.getByDisplayValue('Testname')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123456785678')).toBeInTheDocument();
    expect(screen.getByText('text.khun')).toBeInTheDocument();
  });
  expect(screen.getAllByRole('textbox')).toHaveLength(4);
});

test('PolicyholderInfo handles policy change failed', async () => {
  mockUpdateOrderResponse.mockReturnValueOnce([
    jest.fn().mockResolvedValue({
      error: {
        status: 400,
        data: {
          code: 3,
          message: 'error',
          details: [],
        },
      },
    }),
    {
      isSuccess: false,
      isError: true,
      error: {
        status: 400,
        data: {
          code: 3,
          message: 'error',
          details: [],
        },
      },
      data: {},
      isLoading: false,
    },
  ]);
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });
  const radio = screen.getAllByRole('radio')[0];
  await user.click(radio);
  expect(mockShowError).toHaveBeenCalled();
});

test('PolicyholderInfo prevent company missing name and taxId', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });

  const companyOption = screen.getAllByRole('radio')[2];
  await user.click(companyOption);

  const companyName = screen.getAllByRole('textbox')[0] as HTMLInputElement;
  const taxId = screen.getAllByRole('textbox')[1] as HTMLInputElement;

  await waitFor(() => {
    expect(companyName.value).toBe('');
    expect(taxId.value).toBe('');
  });
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
});

test('PolicyholderInfo updates lead for policy holder fields', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });

  const firstName = screen.getByTestId('policyholder-first-name');
  const firstField = firstName.closest('[data-testid="text-input-field"]');
  if (!firstField) {
    throw new Error('First name field not found');
  }
  await user.click(within(firstField).getByTestId('text-input-field-edit'));
  const firstInput = firstName.querySelector('input');
  if (!firstInput) {
    throw new Error('First name input not found');
  }
  fireEvent.change(firstInput, { target: { value: 'John' } });
  fireEvent.blur(firstInput);

  const lastName = screen.getByTestId('policyholder-last-name');
  const lastField = lastName.closest('[data-testid="text-input-field"]');
  if (!lastField) {
    throw new Error('Last name field not found');
  }
  await user.click(within(lastField).getByTestId('text-input-field-edit'));
  const lastInput = lastName.querySelector('input');
  if (!lastInput) {
    throw new Error('Last name input not found');
  }
  fireEvent.change(lastInput, { target: { value: 'Doe' } });
  fireEvent.blur(lastInput);

  const documentId = screen.getByTestId('policyholder-id-number');
  const docField = documentId.closest('[data-testid="text-input-field"]');
  if (!docField) {
    throw new Error('Document ID field not found');
  }
  await user.click(within(docField).getByTestId('text-input-field-edit'));
  const docInput = documentId.querySelector('input');
  if (!docInput) {
    throw new Error('Document ID input not found');
  }
  fireEvent.change(docInput, { target: { value: '1234567890' } });
  fireEvent.blur(docInput);

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/policyHolderFirstName',
      'John'
    );
    expect(mockUpdateLead).toHaveBeenCalledWith('/policyHolderLastName', 'Doe');
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/policyHolderNationalId',
      '1234567890'
    );
  });
});

test('PolicyholderInfo updates lead for date of birth', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });

  const dobButton = screen.getByTestId('mock-dob');
  await user.click(dobButton);

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/policyHolderDOB',
      '1990-01-02'
    );
  });
});

test('PolicyholderInfo updates lead for company name and tax ID', async () => {
  const initialState = {
    order: {
      payload: getMockOrder(),
    },
  };
  render(<PolicyholderInfo />, { initialState });

  const companyOption = screen.getAllByRole('radio')[2];
  await user.click(companyOption);

  const companyName = await screen.findByTestId('policyholder-company-name');
  const taxId = await screen.findByTestId('policyholder-taxid');

  const companyField = companyName.closest('[data-testid="text-input-field"]');
  const taxField = taxId.closest('[data-testid="text-input-field"]');
  if (!companyField || !taxField) {
    throw new Error('Company fields not found');
  }

  await user.click(within(companyField).getByTestId('text-input-field-edit'));
  await user.click(within(taxField).getByTestId('text-input-field-edit'));

  const companyInput = companyName.querySelector('input');
  const taxInput = taxId.querySelector('input');
  if (!companyInput || !taxInput) {
    throw new Error('Company inputs not found');
  }

  fireEvent.change(companyInput, { target: { value: 'ACME Co' } });
  fireEvent.blur(companyInput);

  fireEvent.change(taxInput, { target: { value: 'TAX123' } });
  fireEvent.blur(taxInput);

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/customerPolicyAddress/0/companyName',
      'ACME Co'
    );
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/customerPolicyAddress/0/taxId',
      'TAX123'
    );
  });
});

describe('getFormattedOrder', () => {
  it('returns formatted order when user is policyholder', () => {
    const orderData = {
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
      customer: {
        firstName: 'Test',
        lastName: 'Test',
        dateOfBirth: '1992-02-29T00:00:00Z',
      },
      data: {
        policyHolder: {
          communicationLanguage: 'th-th',
          dateOfBirth: '1992-02-29',
          firstName: 'Test',
          gender: 'm',
          isCompany: false,
          isCustomer: true,
          lastName: 'Test',
          policyAddress: {
            address: '134',
            addressType: 'personal',
            district: 150200,
            fullName: 'Test Test',
            isBillingAddress: true,
            isShippingAddress: true,
            postCode: 14140,
            province: 150000,
            subDistrict: 150201,
          },
          title: 'MR',
        },
      },
    };

    const policyHolderData = {
      value: 'isPolicyholder',
      payload: { isCustomer: true, isCompany: false },
    };

    const formattedOrder = getFormattedOrder(
      orderData,
      policyHolderData,
      'personal'
    );

    expect(formattedOrder).toEqual({
      data: {
        policyHolder: {
          communicationLanguage: 'th-th',
          dateOfBirth: '1992-02-29',
          firstName: 'Test',
          gender: 'm',
          isCompany: false,
          isCustomer: true,
          lastName: 'Test',
          policyAddress: {
            address: '134',
            addressType: 'personal',
            district: 150200,
            fullName: 'Test Test',
            isBillingAddress: true,
            isShippingAddress: true,
            postCode: 14140,
            province: 150000,
            subDistrict: 150201,
          },
          title: 'MR',
        },
      },
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
    });
  });

  it('returns formatted order when company is policyholder', () => {
    const orderData = {
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
      customer: {
        firstName: 'Test',
        lastName: 'Test',
        dateOfBirth: '1992-02-29T00:00:00Z',
      },
      data: {
        policyHolder: {
          addressType: 'company',
          isCompany: true,
          isCustomer: false,
          companyName: 'Hakunamatata',
          companyTaxId: 'TX872123987',
        },
      },
    };

    const policyHolderData = {
      value: 'isCompany',
      payload: { isCustomer: false, isCompany: true },
    };

    const formattedOrder = getFormattedOrder(
      orderData,
      policyHolderData,
      'company'
    );

    expect(formattedOrder).toEqual({
      data: {
        policyHolder: {
          addressType: 'company',
          companyName: 'Hakunamatata',
          companyTaxId: 'TX872123987',
          isCompany: true,
          isCustomer: false,
          policyAddress: {
            addressType: 'company',
            companyName: 'Hakunamatata',
            taxId: 'TX872123987',
          },
        },
      },
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
    });
  });

  it('returns formatted order when user is isNotPolicyholder', () => {
    const orderData = {
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
      customer: {
        firstName: 'Test',
        lastName: 'Test',
        dateOfBirth: '1992-02-29T00:00:00Z',
      },
      data: {
        policyHolder: {
          dateOfBirth: '1992-02-29',
          firstName: 'Test',
          isCompany: false,
          isCustomer: true,
          lastName: 'Test',
          title: 'Mr',
          gender: 'm',
          addressType: 'personal',
          policyAddress: {
            address: '134',
            addressType: 'personal',
            district: 150200,
            fullName: 'Test Test',
            isBillingAddress: true,
            isShippingAddress: true,
            postCode: 14140,
            province: 150000,
            subDistrict: 150201,
          },
        },
      },
    };

    const policyHolderData = {
      value: 'isNotPolicyholder',
      payload: { isCustomer: false, isCompany: false },
    };

    const formattedOrder = getFormattedOrder(
      orderData,
      policyHolderData,
      'personal'
    );

    expect(formattedOrder).toEqual({
      data: {
        policyHolder: {
          addressType: 'personal',
          dateOfBirth: '1992-02-29',
          firstName: 'Test',
          gender: 'm',
          isCompany: false,
          isCustomer: false,
          lastName: 'Test',
          policyAddress: {
            address: '134',
            addressType: 'personal',
            district: 150200,
            fullName: 'Test Test',
            isBillingAddress: true,
            isShippingAddress: true,
            postCode: 14140,
            province: 150000,
            subDistrict: 150201,
          },
          title: 'Mr',
        },
      },
      name: 'orders/eb54b833-0eb3-4780-af13-280f91b3db4f',
    });
  });
});
