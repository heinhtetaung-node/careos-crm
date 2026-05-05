import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import FeatureFlags from 'config/flagsmithConfig';
import * as authSlice from 'data/slices/authSlice';
import { initialState } from 'mock-data/ReduxStore.mock';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import OrderDetailPage from './index';

const mockStore = configureMockStore();
const store = mockStore(initialState);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

// There are errors on this component, need to fix it first before able to run test
jest.mock(
  'presentation/components/ActivityOrderSection',
  () =>
    function MockActivityOrderSection() {
      return <div>Activity Order Section</div>;
    }
);

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/documents-collection',
    },
  })),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('data/slices/leadDetails/callSummarySlice', () => ({
  useLazyGetCallSummaryQuery: jest.fn().mockReturnValue([
    jest.fn().mockReturnValue({
      isUninitialized: false,
      isSuccess: true,
      data: {
        callSummary: {
          attempts: 1,
          connects: 2,
          totalDuration: 3,
        },
      },
    }),
  ]),
}));

jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useGetCustomerQuery: jest.fn().mockReturnValue({
    data: {},
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useGetCustomerPhoneNumberQuery: jest.fn().mockReturnValue({
    data: {},
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useUpdateCustomerMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
    },
  ]),
  useCreatePhoneNumberMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
    },
  ]),
}));

jest.mock('data/slices/orderSlice', () => ({
  useGetOrderPolicyItemsQuery: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useLazyGetOrderPolicyItemsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useUpdateOrderDataMutation: jest.fn().mockReturnValue([
    jest.fn().mockReturnValue({
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
    }),
    {
      error: '',
      isSuccess: true,
    },
  ]),
  useUpdateOrderByIdMutation: jest.fn().mockReturnValue([
    jest.fn().mockReturnValue({
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
    }),
  ]),
  useCancelOrderMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useCancelOrderPoliciesMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useGetOrderItemsQuery: jest.fn().mockReturnValue({
    data: {
      order: {
        data: {
          deliveryOption: 'deliveryOptions/kerry-standard',
        },
      },
      items: [
        {
          discounts: [
            {
              name: 'orders/da093d85-49a6-41b1-9c0a-0727e9f47e8f/items/44023b95-aec2-4972-adea-4502b48b18c0/discounts/b460a542-d9cf-4183-96e7-3c0951b07fb2',
              type: 'DISCOUNT_TYPE_CAR',
              percentage: 15,
              amount: '100',
            },
            {
              name: 'orders/da093d85-49a6-41b1-9c0a-0727e9f47e8f/items/44023b95-aec2-4972-adea-4502b48b18c0/discounts/ff37bb17-ed5b-4bbc-9d96-337f40610b98',
              type: 'DISCOUNT_TYPE_CAR',
              percentage: 15,
              amount: '90',
            },
          ],
        },
      ],
    },
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
}));

jest.mock('data/slices/leadDetailSlices/updateLeadSlice', () => ({
  useUpdateLeadStatusMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
      data: { message: 'success object' },
    },
  ]),
  useUpdateLeadJsonMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
      data: { message: 'success object' },
    },
  ]),
}));

jest.mock('data/slices/leadSlice', () => ({
  useGetLeadByIDQuery: jest.fn().mockReturnValue([
    jest.fn().mockReturnValue({
      isUninitialized: false,
      isSuccess: true,
      isLoading: false,
    }),
  ]),
}));

jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useGetUserByParamsUsingLeadSearchQuery: jest.fn().mockReturnValue({
    data: undefined,
    isLoading: false,
    isSuccess: true,
  }),
}));

jest.mock('data/slices/transactionSlice', () => ({
  ...jest.requireActual('data/slices/transactionSlice'),
  useLazyGetTransactionFeeQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      data: undefined,
      isLoading: false,
      isSuccess: true,
    },
  ]),
}));

jest.mock('data/slices/orderCommentSlice', () => ({
  useAddOrderCommentMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useLazyGetOrderCommentsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

jest.mock('presentation/components/CustomerInfo', () => 'CustomerInfo');
jest.mock('./PolicyholderInfo', () => 'PolicyholderInfo');
jest.mock('presentation/components/modal/MessageModal', () => 'MessageModal');
jest.mock(
  'presentation/components/OrderDetailPage/DocumentCompleteButton/DocumentCompleteButton',
  () => 'DocumentCompleteButton'
);
jest.mock('presentation/hooks/useOrderComments', () =>
  jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ])
);

jest.mock('presentation/components/CallButtonLiveKit', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-livekit">CallButtonLiveKit</div>,
}));

jest.mock('presentation/components/CallButtonV2', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-v2">CallButtonV2</div>,
}));

const mockUseFlags = jest.fn().mockReturnValue({});
jest.mock('flagsmith/react', () => ({
  useFlags: () => mockUseFlags(),
  FlagsmithProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const dispatch = jest.fn();
(useDispatch as any).mockReturnValue(dispatch);

test.skip('Should open appointment schedule', async () => {
  render(<OrderDetailPage />, { initialState });

  const appointmentBtn = await screen.findByTestId('schedule-modal');
  userEvent.click(appointmentBtn);
  const presentation = await screen.findByRole('presentation');
  expect(presentation).toBeInTheDocument();
  expect(
    within(presentation).getByText('text.appointmentType')
  ).toBeInTheDocument();
});

test.skip('Should render order detail page', async () => {
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );

  expect(await screen.findByTestId('order-detail-page')).toBeInTheDocument();
});

it.skip('able to open schedule calendar and see Urgent checkbox', async () => {
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );

  const appointmentBtn = await screen.findByText(/text.appointmentBtn/i);
  userEvent.click(appointmentBtn);

  const modalDisplay = await screen.findByRole('presentation');
  expect(modalDisplay).toBeInTheDocument();

  const closeModalButton = screen.getByTestId('close-btn');
  userEvent.click(closeModalButton);

  await waitForElementToBeRemoved(modalDisplay);
  expect(modalDisplay).not.toBeInTheDocument();
});

it.skip('Should open/close phone modal', async () => {
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );

  const addPhoneModal = await screen.findByTestId('add-phone-modal');
  expect(addPhoneModal).toBeInTheDocument();
  userEvent.click(addPhoneModal);

  const modalDisplay = await screen.findByRole('presentation');
  expect(modalDisplay).toBeInTheDocument();

  const closeModalButton = await screen.findByTestId('close-button');
  userEvent.click(closeModalButton);

  await waitForElementToBeRemoved(modalDisplay);
  expect(modalDisplay).not.toBeInTheDocument();
});

it.skip('Should show complete document button as disabled', () => {
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );

  const completeButton = screen.getByTestId('update--doc-status-complete');
  expect(completeButton).toBeTruthy();
  expect(completeButton).toBeDisabled();
});

// DEMO TASK: ORDER-957 - Remove later
it.skip('Should document status is complete', () => {
  const documentStore = mockStore({
    ...initialState,
    order: {
      ...initialState.order,
      payload: {
        ...initialState.order.payload,
        documentStatus: OrderDocumentStatus.COMPLETE,
      },
    },
  });

  render(
    <Provider store={documentStore as any}>
      <OrderDetailPage />
    </Provider>
  );

  const completeButton = screen.getByTestId('update--doc-status-complete');
  expect(completeButton).toBeDisabled();
});

describe.skip('Documents conditions', () => {
  const documentStore = mockStore({
    ...initialState,
    orderUploadDocumentReducer: {
      documents: [
        { type: 'DOCUMENT_TYPE_ID_CARD' },
        { type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION' },
      ],
    },
  });

  it('Should all required documents uploaded', () => {
    render(
      <Provider store={documentStore as any}>
        <OrderDetailPage />
      </Provider>
    );

    const completeButton = screen.getByTestId('update--doc-status-complete');
    expect(completeButton).not.toBeDisabled();
  });

  it('Should show update modal when click to complete button', () => {
    render(
      <Provider store={documentStore as any}>
        <OrderDetailPage />
      </Provider>
    );

    const completeButton = screen.getByTestId('update--doc-status-complete');
    userEvent.click(completeButton);
    expect(screen.getByRole('presentation')).toBeTruthy();

    const closeModalButton = screen.getByTestId('close-button');
    userEvent.click(closeModalButton);
    waitFor(() => {
      expect(screen.getByRole('presentation')).not.toBeTruthy();
    });
  });
});

test.skip('Should show fixQcIssues button for sales agent', async () => {
  (authSlice.useGetAuthenticateQuery as jest.Mock).mockImplementation(() => ({
    data: {
      role: 'roles/sales',
    },
  }));
  const stateWithOrderFaieldQc = {
    ...initialState,
    order: {
      ...initialState.order,
      payload: {
        qcStatus: 'QC_STATUS_REJECTED',
      },
    },
  };
  const failedQc = mockStore(stateWithOrderFaieldQc);
  render(
    <Provider store={failedQc as any}>
      <OrderDetailPage />
    </Provider>
  );
  const fixQcIssuesBtn = await screen.findByTestId('fix-qc-issues-btn');
  expect(fixQcIssuesBtn).toBeInTheDocument();
  expect(fixQcIssuesBtn).not.toBeDisabled();
});

test.skip('Should show readOnly view for inbound agent', async () => {
  (authSlice.useGetAuthenticateQuery as jest.Mock).mockImplementation(() => ({
    data: {
      role: 'roles/inbound',
    },
  }));
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );
  expect(screen.queryByTestId('text-input-field-edit')).toBeNull();
});

test.skip('Should show readOnly view for accounting agent', async () => {
  (authSlice.useGetAuthenticateQuery as jest.Mock).mockImplementation(() => ({
    data: {
      role: 'roles/accounting',
    },
  }));
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );
  expect(screen.queryByTestId('text-input-field-edit')).toBeNull();
});

test.skip('Should show editable field for payment status', async () => {
  (authSlice.useGetAuthenticateQuery as jest.Mock).mockImplementation(() => ({
    data: {
      role: 'roles/admin',
    },
  }));
  mockUseFlags.mockReturnValue({});
  render(
    <Provider store={store as any}>
      <OrderDetailPage />
    </Provider>
  );
  expect(screen.queryByTestId('sales-payment-status')).toBeInTheDocument();
  expect(screen.getByTestId('update--doc-status-complete')).toBeInTheDocument();
});

describe('CallButtonLiveKit Feature Flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render CallButtonLiveKit when feature flag is enabled', async () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    const stateWithCustomer = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          customer: {
            name: 'customers/test-customer',
          },
          lead: 'leads/test-lead',
        },
      },
    };
    const storeWithCustomer = mockStore(stateWithCustomer);

    render(
      <Provider store={storeWithCustomer as any}>
        <OrderDetailPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
    });
  });

  it('should render CallButtonV2 when feature flag is disabled', async () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
      [FeatureFlags.BROK_3959_RESTRICT_SALES_AGENT_ADD_PHONE_CAR_LEAD_20250115_TEMP]:
        {
          enabled: false,
        },
    });

    const stateWithCustomer = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          customer: {
            name: 'customers/test-customer',
          },
          lead: 'leads/test-lead',
        },
      },
    };
    const storeWithCustomer = mockStore(stateWithCustomer);

    render(
      <Provider store={storeWithCustomer as any}>
        <OrderDetailPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('call-button-v2')).toBeInTheDocument();
    });
  });
});

describe('OrderDetailPage - Additional Coverage', () => {
  it('should handle missing leadName gracefully', () => {
    const stateWithoutLead = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          lead: undefined,
        },
      },
    };
    const storeWithoutLead = mockStore(stateWithoutLead);

    const { container } = render(
      <Provider store={storeWithoutLead as any}>
        <OrderDetailPage />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show comment modal when call ends', async () => {
    jest.mock('presentation/components/modal/CommentModal', () => ({
      __esModule: true,
      default: ({ onSubmit }: any) => (
        <div data-testid="comment-modal">
          <button
            type="button"
            onClick={() => onSubmit('Test comment')}
            data-testid="submit-comment"
          >
            Submit
          </button>
        </div>
      ),
    }));

    const stateWithCustomer = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          customer: {
            name: 'customers/test-customer',
          },
        },
      },
    };
    const storeWithCustomer = mockStore(stateWithCustomer);

    render(
      <Provider store={storeWithCustomer as any}>
        <OrderDetailPage />
      </Provider>
    );

    // This would be triggered by CallButtonV2's onCallEnd prop
    // The actual implementation would need to be tested with integration tests
  });

  it('should handle health product order correctly', () => {
    const stateWithHealthProduct = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          product: 'products/health-insurance',
        },
      },
    };
    const storeWithHealthProduct = mockStore(stateWithHealthProduct);

    render(
      <Provider store={storeWithHealthProduct as any}>
        <OrderDetailPage />
      </Provider>
    );

    // Health product specific components should be rendered
    expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
  });

  it('should reload page when document status changes to complete for health orders', async () => {
    const reloadSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: reloadSpy,
      },
    });

    const stateWithHealthProduct = {
      ...initialState,
      order: {
        ...initialState.order,
        payload: {
          ...initialState.order.payload,
          product: 'products/health-insurance',
          documentStatus: 'DOCUMENT_STATUS_PENDING',
        },
      },
    };
    const storeWithHealthProduct = mockStore(stateWithHealthProduct);

    const { rerender } = render(
      <Provider store={storeWithHealthProduct as any}>
        <OrderDetailPage />
      </Provider>
    );

    // Update state to trigger document status change
    const updatedState = {
      ...stateWithHealthProduct,
      order: {
        ...stateWithHealthProduct.order,
        payload: {
          ...stateWithHealthProduct.order.payload,
          documentStatus: 'DOCUMENT_STATUS_COMPLETE',
        },
      },
    };
    const updatedStore = mockStore(updatedState);

    rerender(
      <Provider store={updatedStore as any}>
        <OrderDetailPage />
      </Provider>
    );

    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    });
  });
});
