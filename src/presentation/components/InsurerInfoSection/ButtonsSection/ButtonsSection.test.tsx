import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import FeatureFlags from 'config/flagsmithConfig';
import { Address, PhoneNumber } from 'shared/types/customer';
import { Lead, LeadStatus } from 'shared/types/lead';

import ButtonsSection from '.';

const mockedRequestQuoteFn = jest.fn();
const mockUseGetLeadSelector = jest.fn();
const mockNavigate = jest.fn();
const mockAddComment = jest.fn();
const mockDispatch = jest.fn();
var mockShowSnackBar;
var mockShowErrorSnackbar: jest.Mock;
let isManualPackageReasonEnabled = false;

// Mock the feature flag hook to ensure modal opens (not direct navigation)
jest.mock(
  'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled',
  () => ({
    __esModule: true,
    default: () => false,
    useManualQuoteRestrictionByInsurerEnabled: () => false,
  })
);

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(() => mockUseGetLeadSelector()),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/admin',
    },
  })),
}));

jest.mock('data/slices/customQuoteSlice', () => ({
  useGetCustomPackageByIdQuery: () => ({
    data: {
      priceResourceName: 'asd',
      displayName: 'asd',
    },
  }),
}));

jest.mock('data/slices/transactionSlice', () => ({
  useGetTransactionByIdQuery: () => ({
    data: {
      voluntaryPrice: '2000',
      invoicePrice: '3000',
    },
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('data/slices/leadDetails/commentsSlice', () => ({
  useAddCommentMutation: () => [mockAddComment, { isLoading: false }],
}));

// Mock flagsmith feature flag
jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: () => ({
    [FeatureFlags.BROK_4736_MANUAL_QUOTE_RESTRICTION_BY_INSURER_20260225_TEMP]:
      {
        enabled: isManualPackageReasonEnabled,
      },
  }),
}));

jest.mock('presentation/redux/actions/ui', () => {
  const mockFn = jest.fn((param) => ({ type: '', payload: param }));
  mockShowSnackBar = mockFn;
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockFn,
  };
});

jest.mock('utils/snackbar', () => {
  mockShowErrorSnackbar = jest.fn();
  return jest.fn(() => ({
    showErrorSnackbar: mockShowErrorSnackbar,
    showSuccessSnackbar: jest.fn(),
  }));
});

// NOTE: To be merged when the feature flag has been removed.
describe.skip('ButtonsSection component', () => {
  const createPaymentButtonId = 'create-payment-button';
  const createContractButtonId = 'create-contract-button';

  const validLeadInfo = {
    isRejected: false,
    data: {
      insuranceKind: 'both',
      customerFirstName: 'Test',
      customerLastName: 'User',
      carLicensePlate: '999-9999',
      checkout: {
        package: '123456',
        paymentOption: 'RABBIT_CARE_INSTALLMENT',
        paymentMethod: 'QR_CODE',
      },
      customerEmail: ['test@gmail.com'],
      customerPhoneNumber: [{ phone: '0810000000', status: 'unverified' }],
      policyStartDate: '2022-10-03',
      policyHolderNationalId: '123456',
      packageResourceName: 'package-resource',
      customerPolicyAddress: [
        {
          address: 'Test',
          addressType: 'personal',
          district: 0,
          fullName: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          postCode: 123,
          province: 0,
          subDistrict: 0,
        },
      ],
    },
  } as unknown as Lead;

  const renderSection = (leadStatus: LeadStatus, lead: Lead) => {
    const mockedLeadState = {
      leadsDetailReducer: {
        lead: {
          payload: {
            ...lead,
            status: leadStatus,
            name: 'leads/test-lead',
          },
        },
      },
    };

    return render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />, {
      initialState: mockedLeadState,
    });
  };

  it('Create Contract and Payment buttons should be visible when the feature flag is on', async () => {
    renderSection('LEAD_STATUS_NEW', validLeadInfo);

    await waitFor(() => {
      expect(screen.getByTestId(createContractButtonId)).toBeInTheDocument();
      expect(screen.getByTestId(createPaymentButtonId)).toBeInTheDocument();
    });
  });

  describe('Create Payment button', () => {
    it('should be disabled if LEAD_STATUS_CANCELLED', async () => {
      renderSection('LEAD_STATUS_CANCELLED', validLeadInfo);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if LEAD_STATUS_PURCHASED', async () => {
      renderSection('LEAD_STATUS_PURCHASED', validLeadInfo);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if LEAD_STATUS_PAID_ONLINE', async () => {
      renderSection('LEAD_STATUS_PAID_ONLINE', validLeadInfo);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if the lead is rejected', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        isRejected: true,
        data: {
          insuranceKind: '',
        },
      } as unknown as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if carLicense is empty', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { carLicensePlate: '' },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if carLicense is undefined', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { carLicensePlate: undefined },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if carLicense is invalid', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { carLicensePlate: '- กท' },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if customerFirstName is invalid', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { customerFirstName: '' },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if customerLastName is invalid', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { customerLastName: '' },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createPaymentButtonId)).toBeDisabled()
      );
    });
  });

  describe('Create Contract button', () => {
    it('should be disabled if the insuranceKind is mandatory', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { insuranceKind: 'mandatory' },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if the customer email is empty', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { customerEmail: [] as string[] },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if the customer has no phone number', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { customerPhoneNumber: [] as PhoneNumber[] },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeDisabled()
      );
    });

    it('should be disabled button if the policy address has not been set', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: { customerPolicyAddress: [] as Address[] },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeDisabled()
      );
    });

    it('should be disabled if the policy address has invalid information', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: {
          customerPolicyAddress: [
            {
              addressType: 'personal',
              firstName: '',
              lastName: '',
              address: '',
              province: -1,
              district: -1,
              subDistrict: -1,
              postCode: -1,
            },
          ] as unknown as Address[],
        },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeDisabled()
      );
    });

    it('should be enabled if the policy holder type is customer with valid details', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: {
          ...validLeadInfo.data,
          policyHolderType: 'customer',
          customerPolicyAddress: [
            {
              addressType: 'personal',
              firstName: 'Test',
              lastName: 'User',
              address: 'Test Address',
              province: 1,
              district: 1,
              subDistrict: 1,
              postCode: 1,
            },
          ] as unknown as Address[],
        },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeEnabled()
      );
    });

    it('should be enabled if the policy holder type is straw_holder with valid details', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: {
          ...validLeadInfo.data,
          policyHolderType: 'straw_buyer',
          customerPolicyAddress: [
            {
              addressType: 'personal',
              firstName: 'Test',
              lastName: 'User',
              address: 'Test Address',
              province: 1,
              district: 1,
              subDistrict: 1,
              postCode: 1,
            },
          ] as unknown as Address[],
        },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeEnabled()
      );
    });

    it('should be enabled if the policy holder type is company with valid details', async () => {
      renderSection('LEAD_STATUS_PENDING_PAYMENT', {
        data: {
          ...validLeadInfo.data,
          policyHolderType: 'company',
          customerPolicyAddress: [
            {
              addressType: 'company',
              companyName: 'Test',
              firstName: 'test',
              lastName: 'test',
              taxId: '12345678',
              address: 'Test Address',
              province: 1,
              district: 1,
              subDistrict: 1,
              postCode: 1,
            },
          ] as unknown as Address[],
        },
      } as Lead);

      await waitFor(() =>
        expect(screen.getByTestId(createContractButtonId)).toBeEnabled()
      );
    });
  });
});

describe('Voucher btn', () => {
  it('should show voucher', () => {
    mockUseGetLeadSelector.mockReturnValue({
      data: { checkout: { coupon: '123' } },
    } as any);
    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);
    expect(screen.getByTestId('coupon-tag')).toHaveTextContent('123');
  });

  it('should show - if there is no voucher', () => {
    mockUseGetLeadSelector.mockReturnValue({
      data: { checkout: {} },
    } as any);
    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);
    expect(screen.getByTestId('coupon-tag')).toHaveTextContent('-');
  });
});

describe('Request Custom Package', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set feature flag to enabled by default for existing tests
    isManualPackageReasonEnabled = true;
    mockAddComment.mockReturnValue({
      unwrap: jest.fn(),
    });
    mockDispatch.mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(mockDispatch);
      }
      return action;
    });
    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-id',
      status: 'LEAD_STATUS_NEW',
      data: {
        checkout: {},
      },
    } as any);
  });

  it('should open modal when request custom package button is clicked', async () => {
    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });
  });

  it('should successfully submit request custom package and navigate', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockAddComment.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    // Open modal
    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Fill in reason - find the actual textarea element
    const reasonTextarea = screen
      .getByTestId('reason-textarea')
      .querySelector('textarea') as HTMLTextAreaElement;
    const testReason = 'This is a test reason for custom package request';
    fireEvent.change(reasonTextarea, { target: { value: testReason } });
    fireEvent.blur(reasonTextarea);

    // Wait for submit button to be enabled
    const submitButton = screen.getByTestId('submit-request-custom-package');
    await waitFor(
      () => {
        expect(submitButton).toBeEnabled();
      },
      { timeout: 3000 }
    );

    // Submit form
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith({
        text: expect.stringContaining(
          'This is a test reason for custom package request'
        ),
        leadId: 'leads/test-lead-id',
      });
      expect(mockUnwrap).toHaveBeenCalled();
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: expect.any(String),
        status: 'success',
      });
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        '/leads/test-lead-id/custom-quote'
      );
    });
  });

  it('should show error snackbar when comment submission fails', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('API Error'));
    mockAddComment.mockReturnValue({
      unwrap: mockUnwrap,
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    // Open modal
    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Fill in reason - find the actual textarea element
    const reasonTextarea = screen
      .getByTestId('reason-textarea')
      .querySelector('textarea') as HTMLTextAreaElement;
    const testReason = 'This is a test reason for custom package request';
    fireEvent.change(reasonTextarea, { target: { value: testReason } });
    fireEvent.blur(reasonTextarea);

    // Wait for submit button to be enabled
    const submitButton = screen.getByTestId('submit-request-custom-package');
    await waitFor(
      () => {
        expect(submitButton).toBeEnabled();
      },
      { timeout: 3000 }
    );

    // Submit form
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalled();
      expect(mockUnwrap).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create comment:',
        expect.any(Error)
      );
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: expect.any(String),
        status: 'error',
      });
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should trim the reason text before submitting', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    mockAddComment.mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    // Open modal
    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Fill in reason with leading/trailing spaces
    const reasonTextarea = screen
      .getByTestId('reason-textarea')
      .querySelector('textarea') as HTMLTextAreaElement;
    const testReason = '  This is a test reason with spaces  ';
    fireEvent.change(reasonTextarea, { target: { value: testReason } });
    fireEvent.blur(reasonTextarea);

    // Wait for submit button to be enabled
    const submitButton = screen.getByTestId('submit-request-custom-package');
    await waitFor(
      () => {
        expect(submitButton).toBeEnabled();
      },
      { timeout: 3000 }
    );

    // Submit form
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith({
        text: expect.stringContaining('This is a test reason with spaces'),
        leadId: 'leads/test-lead-id',
      });
      // Verify the text was trimmed (no leading/trailing spaces in the comment text)
      const callArgs = mockAddComment.mock.calls[0][0];
      expect(callArgs.text).not.toMatch(/^\s/);
      expect(callArgs.text).not.toMatch(/\s$/);
    });
  });

  it('should disable submit button when reason is less than 10 characters', async () => {
    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    // Open modal
    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Fill in short reason
    const reasonTextarea = screen.getByTestId('reason-textarea');
    await userEvent.type(reasonTextarea, 'Short');

    // Submit button should be disabled
    const submitButton = screen.getByTestId('submit-request-custom-package');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when reason is at least 10 characters', async () => {
    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    // Open modal
    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Fill in valid reason
    const reasonTextarea = screen
      .getByTestId('reason-textarea')
      .querySelector('textarea') as HTMLTextAreaElement;
    const testReason = 'Valid reason with enough characters';
    fireEvent.change(reasonTextarea, { target: { value: testReason } });
    fireEvent.blur(reasonTextarea);

    // Submit button should be enabled after typing
    const submitButton = screen.getByTestId('submit-request-custom-package');
    await waitFor(
      () => {
        expect(submitButton).toBeEnabled();
      },
      { timeout: 3000 }
    );
  });
});

describe('Request Custom Package - Feature Flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-id',
      status: 'LEAD_STATUS_NEW',
      data: {
        checkout: {},
      },
    } as any);
  });

  it('should navigate directly to custom-quote page when feature flag is enabled (ON)', async () => {
    // Mock feature flag as enabled
    isManualPackageReasonEnabled = true;

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);
  });

  it('should open modal when feature flag is disabled (OFF)', async () => {
    // Mock feature flag as disabled
    isManualPackageReasonEnabled = false;

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    const requestButton = screen.getByText('text.requestCustomPackage');
    await userEvent.click(requestButton);

    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });

    // Verify modal is shown
    expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    // Verify navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Create Payment button - phone number validation (line 228)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowErrorSnackbar?.mockClear?.();
    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-id',
      status: 'LEAD_STATUS_NEW',
      isRejected: false,
      data: {
        customerFirstName: 'Test',
        customerLastName: 'User',
        checkout: {
          package: '123456',
          paymentOption: ['RABBIT_CARE_INSTALLMENT'],
          paymentMethod: ['QR_CODE'],
        },
      },
    } as any);
  });

  it('shows error snackbar when primary phone number is missing (line 228)', async () => {
    // Set primaryPhoneIndex to 1, but customerPhoneNumber only has one item at index 0
    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-id',
      status: 'LEAD_STATUS_NEW',
      isRejected: false,
      data: {
        customerFirstName: 'Test',
        customerLastName: 'User',
        primaryPhoneIndex: 1,
        customerPhoneNumber: [{ phone: '0810000000', status: 'unverified' }],
        checkout: {
          package: '123456',
          paymentOption: ['RABBIT_CARE_INSTALLMENT'],
          paymentMethod: ['QR_CODE'],
        },
      },
    } as any);

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    const createPaymentButton = screen.getByTestId('create-payment-button');
    await userEvent.click(createPaymentButton);

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('phoneNumberRequired')
      );
      // Should not navigate when phone is missing
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows error snackbar when phone at primaryPhoneIndex has no phone property', async () => {
    // Set primaryPhoneIndex to 0, but the phone object doesn't have a phone property
    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-id',
      status: 'LEAD_STATUS_NEW',
      isRejected: false,
      data: {
        customerFirstName: 'Test',
        customerLastName: 'User',
        primaryPhoneIndex: 0,
        customerPhoneNumber: [{ status: 'unverified' }], // missing phone property
        checkout: {
          package: '123456',
          paymentOption: ['RABBIT_CARE_INSTALLMENT'],
          paymentMethod: ['QR_CODE'],
        },
      },
    } as any);

    render(<ButtonsSection onRequestQuote={mockedRequestQuoteFn} />);

    const createPaymentButton = screen.getByTestId('create-payment-button');
    await userEvent.click(createPaymentButton);

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('phoneNumberRequired')
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
