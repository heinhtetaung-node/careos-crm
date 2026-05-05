import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, act } from '__tests__/rtl-test-utils';
import leadDetail from 'mock-data/LeadDetail.mock';
import * as CONSTANTS from 'shared/constants';
import FeatureFlags from 'config/flagsmithConfig';

import LeadDetailsHeader from './leadDetailsHeader';

var mockCallButton: jest.Mock;
const mockUseFlags = jest.fn();

const customers = [
  {
    name: 'customers/5bfa2467-575b-425a-a507-17ee9926d115',
    createTime: '2022-05-06T04:03:10.388624Z',
    updateTime: '2022-05-06T04:03:10.388624Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: 'C56322',
    firstName: 'Automation',
    lastName: 'API',
  },
  {
    name: 'customers/b692e95b-6b15-422f-b52e-731e60705c38',
    createTime: '2022-05-06T04:02:55.801652Z',
    updateTime: '2022-05-06T04:02:55.801652Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: 'C56321',
    firstName: 'Test',
    lastName: 'Guy',
  },
  {
    name: 'customers/b69se95b-6b15-422f-b52e-731e60705c38',
    createTime: '2022-05-06T04:02:55.801652Z',
    updateTime: '2022-05-06T04:02:55.801652Z',
    deleteTime: null,
    createBy: 'users/20ds8aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: 'C56324',
    firstName: 'Automation',
    lastName: 'API',
  },
];

const mockHandleOpenSummaryModal = jest.fn();
const mockSetOpenPaySlipModal = jest.fn();
const mockSetPaySlip = jest.fn();

const summaryModalType = {
  HANG_UP: 'hang-up',
  CHANGE_STATUS: 'change-status',
};

const props = {
  id: '686d7238-2e89-4cca-b32e-6276c8c78399',
  classes: { grid: '' },
  leadName: '',
  customerId: '186d7238-2e89-4cca-b32e-6276c8c78399',
  isPageDisabled: false,
  summaryModalType,
  isEmailNotiInvisible: false,
  isRenderLeadCallModal: false,
  isAddressNotiInvisible: false,
  isShowCloseSummaryModal: false,
  messageModalHandler: jest.fn(),
  handleOpenSummaryModal: mockHandleOpenSummaryModal,
  setOpenScheduleModalOnPage: jest.fn(),
};

const mockSelectors = {
  leadsDetailReducer: {
    callReducer: {
      data: {
        callStatus: 1,
      },
    },
    lead: {
      payload: { ...leadDetail },
    },
    emailReducer: {
      data: {
        unReadMails: 0,
      },
    },
  },
  uiInitReducer: {
    modal: {},
  },
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: 'products/car-insurance',
    },
  },
  api: {},
};

jest.mock('config/feature-flags', () => ({
  ...jest.requireActual('config/feature-flags'),
  websocketEnabled: true,
}));

jest.mock('presentation/components/CallButtonV2', () => {
  mockCallButton = jest.fn();
  return mockCallButton;
});

const mockCallButtonLiveKitOnCallEnd = jest.fn();
let capturedCustomerId: string | undefined;
jest.mock('presentation/components/CallButtonLiveKit', () => ({
  __esModule: true,
  default: ({
    customerId,
    onCallEnd,
  }: {
    customerId?: string;
    onCallEnd?: () => void;
  }) => {
    // Capture customerId prop to verify it's passed correctly (line 238)
    capturedCustomerId = customerId;
    // Store the callback so we can call it in tests
    if (onCallEnd) {
      mockCallButtonLiveKitOnCallEnd.mockImplementation(onCallEnd);
    }
    return <div data-testid="call-button-livekit">CallButtonLiveKit</div>;
  },
}));

jest.mock('flagsmith/react', () => ({
  useFlags: () => mockUseFlags(),
  FlagsmithProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('data/slices/transactionSlice', () => ({
  useGetTransactionByLeadIdQuery: () => ({
    data: {
      transactions: [],
    },
  }),
}));

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: () => ({
    role: 'roles/admin',
  }),
}));

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: () => ({
    name: 'leads/test-lead',
    data: {
      checkout: {
        paymentMethod: 'CREDIT_CARD',
      },
      status: 'LEAD_STATUS_ACTIVE',
    },
    annotations: {},
  }),
}));

const mockDispatch = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  ...jest.requireActual('presentation/redux/hooks/typedHooks'),
  useAppDispatch: () => mockDispatch,
}));

// Set up default mock for useFlags before all tests
beforeEach(() => {
  jest.clearAllMocks();
  mockHandleOpenSummaryModal.mockClear();
  mockCallButtonLiveKitOnCallEnd.mockClear();
  capturedCustomerId = undefined;
  mockUseFlags.mockReturnValue({
    [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
      {
        enabled: false,
      },
    [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
      enabled: false,
    },
    [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
      enabled: false,
    },
  });
});

describe('test new call button', () => {
  test.skip('on call end', () => {
    const mockfn = jest.fn();
    // eslint-disable-next-line react/jsx-no-useless-fragment
    mockCallButton.mockImplementation(({ onCallEnd }) => (
      <div>{onCallEnd?.()}</div>
    ));
    render(<LeadDetailsHeader {...props} handleOpenSummaryModal={mockfn} />, {
      initialState: mockSelectors,
    });
    expect(mockfn).toHaveBeenCalled();
  });

  test('on call tick', () => {
    const mockfn = jest.fn();
    mockCallButton.mockImplementation(({ onCallTimerTick }) => (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {onCallTimerTick?.(0)}
        {onCallTimerTick?.(10)}
        {onCallTimerTick?.(15)}
      </>
    ));
    render(<LeadDetailsHeader {...props} />, {
      initialState: mockSelectors,
    });
    expect(mockfn).not.toHaveBeenCalled();
  });
});

describe.skip('Testing LeadDetailsHeader along with LeadCallModal', () => {
  const newMockSelectors = {
    ...mockSelectors,
    uiInitReducer: {
      modal: {
        createCustomerModal: true,
      },
    },
    authReducer: {
      data: {
        user: {
          name: 'c84cd1aa-2ab3-4d16-9a98-51086b6dc173',
        },
      },
    },
  };

  const CustomerDemo = {
    name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda',
    createTime: '2022-03-31T04:00:34.466426Z',
    updateTime: '2022-03-31T04:00:34.466426Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: 'C56247',
    firstName: 'Piyush',
    lastName: 'Test',
  };
  const customerId = CustomerDemo.name;
  const leadId = leadDetail.name;

  beforeEach(() => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers`,
        () =>
          HttpResponse.json({
            ...CustomerDemo,
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/leads`,
        () =>
          HttpResponse.json({
            name: leadId,
          })
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}`,
        () =>
          HttpResponse.json({
            firstName: 'demo name',
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/emails`,
        () =>
          HttpResponse.json({
            name: leadId,
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/phones`,
        () =>
          HttpResponse.json({
            name: leadId,
          })
      )
    );
  });

  it('should trigger the paySlipModal', async () => {
    const newProps = {
      ...props,
      isRenderLeadCallModal: true,
      isPaySlip: true,
    };
    render(<LeadDetailsHeader {...newProps} />, {
      initialState: newMockSelectors,
    });
    expect(screen.getByTestId('lead-call-modal')).toBeInTheDocument();
    expect(screen.getByTestId('create-customer-modal')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'text.createNewCustomer' })
    );
    await waitFor(() => {
      expect(mockSetPaySlip).toHaveBeenCalled();
      expect(mockSetOpenPaySlipModal).toHaveBeenCalledWith(true);
    });
  });

  it('should trigger the getConnectedLeadAgain', async () => {
    const newProps = {
      ...props,
      isRenderLeadCallModal: true,
      isCustomerMapped: true,
    };
    render(<LeadDetailsHeader {...newProps} />, {
      initialState: newMockSelectors,
    });
    expect(screen.getByTestId('lead-call-modal')).toBeInTheDocument();
    expect(screen.getByTestId('create-customer-modal')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'text.createNewCustomer' })
    );
    await waitFor(() => {
      expect(mockGetConnectedAgain).toHaveBeenCalled();
    });
  });
});

describe('LeadHeader Ui Checks', () => {
  test('purchase btn should be present', () => {
    render(<LeadDetailsHeader {...props} />);
    expect(
      screen.getByRole('button', { name: 'leadStatus.purchased' })
    ).toBeInTheDocument();
  });
});

describe('Testing LeadDetailsHeader if call is in join state', () => {
  const newMockSelectors = {
    leadsDetailReducer: {
      callReducer: {
        data: {
          callStatus: 3,
        },
      },
    },
  };

  it('should show the call time', async () => {
    render(<LeadDetailsHeader {...props} />, {
      initialState: newMockSelectors,
    });
  });

  it.skip('should fetch connected leads again if customer is there', async () => {
    render(<LeadDetailsHeader {...props} />, {
      initialState: newMockSelectors,
    });
    await waitFor(() => {
      expect(screen.getByTestId('call-time')).toBeInTheDocument();
    });
    await new Promise((resolve) => {
      act(() => {
        setTimeout(resolve, 10_000);
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('call-time').innerHTML).toEqual('00:10');
      expect(mockGetConnectedAgain).toHaveBeenCalled();
    });
  });

  // deprecated test
  it.skip('should update the mapping state if customer is not there', async () => {
    const newProps = { ...props, customerList: null };
    render(<LeadDetailsHeader {...newProps} />, {
      initialState: newMockSelectors,
    });

    await waitFor(() => {
      expect(screen.getByTestId('call-time')).toBeInTheDocument();
    });
    await new Promise((resolve) => {
      act(() => {
        setTimeout(resolve, 10_000);
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('call-time').innerHTML).toEqual('00:10');
      expect(mockSetCustomerMapped).toHaveBeenCalled();
    });
  });
});

// deprecated test
describe.skip('Testing LeadDetailsHeader if call is in end state', () => {
  const newMockSelectors = {
    leadsDetailReducer: {
      callReducer: {
        data: {
          callStatus: 4,
        },
      },
    },
  };
  beforeEach(() => {
    render(<LeadDetailsHeader {...props} />, {
      initialState: newMockSelectors,
    });
  });

  it('should update the timer and update the state', async () => {
    await waitFor(() => {
      expect(mockSetCustomerMapped).toHaveBeenCalledWith(false);
    });
  });
});

describe('Testing LeadDetailsHeader if call is in idle state', () => {
  const newProps = { ...props, isRenderLeadCallModal: true, isPaySlip: true };

  beforeEach(() => {
    render(<LeadDetailsHeader {...newProps} />, {
      initialState: mockSelectors,
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render LeadDetailsHeader', () => {
    expect(screen.getByTestId('lead-detail-header')).toBeInTheDocument();
  });

  it('should update the status', async () => {
    const btn = screen.getByRole('button', { name: 'text.changeStatus' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    await waitFor(() => {
      expect(mockHandleOpenSummaryModal).toHaveBeenCalled();
    });
  });

  it('should close the phone modal by cancel button', async () => {
    const phone = screen.getByRole('button', { name: 'text.phone' });
    await user.click(phone);
    const modal = screen.getByRole('dialog', { name: 'text.addPhoneTitle' });
    const btn = screen.getByRole('button', { name: 'text.closeButton' });
    await user.click(btn);
    waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should close the phone modal by close button', async () => {
    const phone = screen.getByRole('button', { name: 'text.phone' });
    await user.click(phone);

    const modal = screen.getByRole('dialog', { name: 'text.addPhoneTitle' });
    const btn = screen.getByTestId('close-button');
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should close the email modal by cancel button', async () => {
    const phone = screen.getByRole('button', { name: 'text.email' });
    await user.click(phone);
    const modal = screen.getByRole('dialog', {
      name: 'text.addNewEmailAddress',
    });
    const btn = screen.getByRole('button', { name: 'text.cancelButton' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should close the email modal by close button', async () => {
    const phone = screen.getByRole('button', { name: 'text.email' });
    await user.click(phone);
    const modal = screen.getByRole('dialog', {
      name: 'text.addNewEmailAddress',
    });
    const btn = screen.getByTestId('close-button');
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should close the address modal by cancel button', async () => {
    const phone = screen.getByRole('button', { name: 'text.address' });
    await user.click(phone);
    const modal = screen.getByRole('dialog', {
      name: 'text.addNewAddress',
    });
    const btn = screen.getByRole('button', { name: 'text.cancelButton' });
    await user.click(btn);

    waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });

  // FIXME: passes alone but fails with other tests
  it('should close the address modal by close button', async () => {
    const phone = await screen.findByRole('button', { name: 'text.address' });
    user.click(phone);

    const modal = await screen.findByRole('dialog', {
      name: 'text.addNewAddress',
    });
    const btn = await screen.findByTestId('close-button');
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });
  });
});

describe('CallButtonLiveKit Feature Flags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
    });
  });

  it('should render CallButtonLiveKit when CRM-wide flag is enabled', () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    render(<LeadDetailsHeader {...props} />, {
      initialState: mockSelectors,
    });

    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
  });

  it('should render CallButtonLiveKit when integration flag is enabled and not health page', () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: true,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    render(<LeadDetailsHeader {...props} />, {
      initialState: mockSelectors,
    });

    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
  });

  it('should render CallButtonV2 when both flags are disabled', () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    render(<LeadDetailsHeader {...props} />, {
      initialState: mockSelectors,
    });

    expect(screen.queryByTestId('call-button-livekit')).not.toBeInTheDocument();
  });

  it('should render CallButtonV2 for health page even when integration flag is enabled', () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: true,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    // Mock health product in state
    const healthSelectors = {
      ...mockSelectors,
      typeSelectorReducer: {
        globalProductSelectorReducer: {
          data: 'products/health-insurance',
        },
      },
    };

    render(<LeadDetailsHeader {...props} />, {
      initialState: healthSelectors,
    });

    // For health pages, even with integration flag enabled, should use V2
    expect(screen.queryByTestId('call-button-livekit')).not.toBeInTheDocument();
  });

  it('should call handleOpenSummaryModal when onCallEnd is triggered', () => {
    // Enable CRM-wide flag to render CallButtonLiveKit
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    render(<LeadDetailsHeader {...props} />, {
      initialState: mockSelectors,
    });

    // Verify CallButtonLiveKit is rendered
    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();

    // Call the onCallEnd callback (simulating call end)
    mockCallButtonLiveKitOnCallEnd();

    // Verify handleOpenSummaryModal was called with HANG_UP
    expect(mockHandleOpenSummaryModal).toHaveBeenCalledWith(
      summaryModalType.HANG_UP
    );
    expect(mockCallButtonLiveKitOnCallEnd).toHaveBeenCalled();
  });

  it('should pass customerId to CallButtonLiveKit when customerId is provided (line 238)', () => {
    // Enable CRM-wide flag to render CallButtonLiveKit
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    const testCustomerId = 'customers/test-customer-id';
    const testProps = {
      ...props,
      customerId: testCustomerId,
    };

    render(<LeadDetailsHeader {...testProps} />, {
      initialState: mockSelectors,
    });

    // Verify CallButtonLiveKit is rendered
    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();

    // Verify customerId was passed correctly (line 238: customerId={customerId ?? ''})
    expect(capturedCustomerId).toBe(testCustomerId);
  });

  it('should pass empty string to CallButtonLiveKit when customerId is undefined (line 238)', () => {
    // Enable CRM-wide flag to render CallButtonLiveKit
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    const testProps = {
      ...props,
      customerId: undefined,
    };

    render(<LeadDetailsHeader {...testProps} />, {
      initialState: mockSelectors,
    });

    // Verify CallButtonLiveKit is rendered
    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();

    // Verify empty string was passed when customerId is undefined (line 238: customerId={customerId ?? ''})
    expect(capturedCustomerId).toBe('');
  });

  it('should pass empty string to CallButtonLiveKit when customerId is null (line 238)', () => {
    // Enable CRM-wide flag to render CallButtonLiveKit
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_4011_ENABLE_CALL_BUTTON_LIVEKIT_INTEGRATION]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    const testProps = {
      ...props,
      customerId: null as any,
    };

    render(<LeadDetailsHeader {...testProps} />, {
      initialState: mockSelectors,
    });

    // Verify CallButtonLiveKit is rendered
    expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();

    // Verify empty string was passed when customerId is null (line 238: customerId={customerId ?? ''})
    expect(capturedCustomerId).toBe('');
  });
});
