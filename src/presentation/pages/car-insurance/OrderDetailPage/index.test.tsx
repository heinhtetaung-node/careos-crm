import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import configureStore from 'redux-mock-store';
import { OrderPage } from './index';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { OrderDocumentStatus, OrderQcStatus } from 'shared/constants/orderType';
import { PRODUCTS } from 'config/TypeFilter';
import * as AuthSlice from 'data/slices/authSlice';
import * as TypedHooks from 'presentation/redux/hooks/typedHooks';
import * as LeadSelector from 'presentation/redux/selectors/lead';
import useOrderComments from 'presentation/hooks/useOrderComments';
import * as ProductOptions from 'shared/constants/productOptions';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';

jest.mock('data/slices/authSlice');
jest.mock('presentation/redux/hooks/typedHooks');
jest.mock('presentation/redux/selectors/lead');
jest.mock('presentation/hooks/useOrderComments');
jest.mock('shared/constants/productOptions');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock window.location.reload
const originalLocation = window.location;
beforeAll(() => {
  delete (window as any).location;
  window.location = {
    ...originalLocation,
    reload: jest.fn(),
  } as any;
});

afterAll(() => {
  window.location = originalLocation;
});

// Mock React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock all dependencies
jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(),
}));

jest.mock('presentation/hooks/useOrderComments', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('presentation/redux/actions/leadDetail/email', () => ({
  ...jest.requireActual('presentation/redux/actions/leadDetail/email'),
  getMailReadCount: jest.fn(),
}));

jest.mock('presentation/redux/actions/leadDetail/getLeadByName', () => ({
  ...jest.requireActual('presentation/redux/actions/leadDetail/getLeadByName'),
  getLead: jest.fn(),
}));

jest.mock('presentation/redux/actions/order', () => ({
  OrderActionTypes: {
    GET_DETAIL: 'GET_DETAIL',
  },
}));

jest.mock('presentation/redux/actions/leadDetail/scheduleModal', () => ({
  ...jest.requireActual('presentation/redux/actions/leadDetail/scheduleModal'),
  destroyModalSchedule: jest.fn(),
}));

jest.mock('presentation/redux/actions/leads/detail', () => ({
  ...jest.requireActual('presentation/redux/actions/leads/detail'),
  getCallParticipants: jest.fn(),
  subscribeLeadUpdates: jest.fn(),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('shared/constants/productOptions', () => ({
  checkProductIsHealth: jest.fn(),
}));

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromLeadName: jest.fn((leadName) => leadName?.split('/')[1] || ''),
}));

jest.mock('./index.styles', () => ({
  useDetailPageStyles: () => ({
    leadDetailPage: 'leadDetailPage',
  }),
  GridBoardItem: ({ children, ...props }: any) => {
    const { extraFields: _extraFields, ...domProps } = props;
    return <div {...domProps}>{children}</div>;
  },
}));

// Mock components with proper prop filtering
jest.mock(
  'presentation/components/ActivityOrderSection',
  () =>
    function MockActivityOrderSection(props: any) {
      const {
        isDocPanelDisabled: _isDocPanelDisabled,
        enablePreviewModalDraggable: _enablePreviewModalDraggable,
        ...domProps
      } = props;
      return <div data-testid="activity-order-section" {...domProps} />;
    }
);

jest.mock(
  'presentation/components/CallSummarySection/CallSummarySection',
  () =>
    function MockCallSummarySection(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="call-summary-section" {...domProps} />;
    }
);

jest.mock(
  'presentation/components/CancelOrder',
  () =>
    function MockCancelOrder(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="cancel-order" {...domProps} />;
    }
);

jest.mock('presentation/components/controls/Control', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock(
  'presentation/components/CustomerInfo',
  () =>
    function MockCustomerInfo(props: any) {
      const { readOnly, ...domProps } = props;
      return (
        <div data-testid="customer-info" readOnly={readOnly} {...domProps} />
      );
    }
);

jest.mock(
  'presentation/components/LeadDetails/CommonButton',
  () =>
    function MockCommonButton({ children, onClick, ...props }: any) {
      return (
        <button type="button" onClick={onClick} {...props}>
          {children}
        </button>
      );
    }
);

jest.mock(
  'presentation/components/LeadDetails/MarkImportantButton',
  () =>
    function MockMarkImportantButton() {
      return <div data-testid="mark-important-button" />;
    }
);

jest.mock(
  'presentation/components/Loader',
  () =>
    function MockLoader() {
      return <div data-testid="loader" />;
    }
);

jest.mock(
  'presentation/components/modal/CommentModal',
  () =>
    function MockCommentModal({ onSubmit }: any) {
      return (
        <div data-testid="comment-modal">
          <button type="button" onClick={() => onSubmit('test comment')}>
            Submit Comment
          </button>
        </div>
      );
    }
);

jest.mock(
  'presentation/components/modal/CommonModal',
  () =>
    function MockCommonModal({ children, open, handleCloseModal }: any) {
      if (!open) return null;
      return (
        <div data-testid="common-modal">
          <button type="button" onClick={handleCloseModal}>
            Close
          </button>
          {children}
        </div>
      );
    }
);

jest.mock(
  'presentation/components/modal/MessageModal/index',
  () =>
    function MockMessageModal({ openDialog, closeDialog }: any) {
      if (!openDialog) return null;
      return (
        <div data-testid="message-modal">
          <button type="button" onClick={() => closeDialog()}>
            Close
          </button>
        </div>
      );
    }
);

jest.mock(
  'presentation/components/modal/OrderScheduleModal/OrderScheduleModalSlice',
  () =>
    function MockOrderScheduleModal({ isOpen, onClose }: any) {
      if (!isOpen) return null;
      return (
        <div data-testid="order-schedule-modal">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      );
    }
);

jest.mock(
  'presentation/components/NotFound',
  () =>
    function MockNotFound() {
      return <div data-testid="not-found" />;
    }
);

jest.mock(
  'presentation/components/OrderDetailPage/DocumentCompleteButton',
  () =>
    function MockDocumentCompleteButton(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="document-complete-button" {...domProps} />;
    }
);

jest.mock(
  'presentation/components/OrderDetailPage/PoliciesInfo',
  () =>
    function MockPoliciesInfo(props: any) {
      const {
        isReadOnly: _isReadOnly,
        insuranceCategory: _insuranceCategory,
        ...domProps
      } = props;
      return <div data-testid="policies-info" {...domProps} />;
    }
);

jest.mock(
  'presentation/components/VehiclePolicySection/VehiclePolicySection',
  () =>
    function MockVehiclePolicySection(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="vehicle-policy-section" {...domProps} />;
    }
);

jest.mock(
  'presentation/components/CallButtonV2',
  () =>
    function MockCallButtonV2(props: any) {
      const { onCallEnd, customerId: _customerId, ...domProps } = props;
      return (
        <div data-testid="call-button-v2" {...domProps}>
          <button type="button" onClick={onCallEnd}>
            End Call
          </button>
        </div>
      );
    }
);

jest.mock(
  './PolicyholderInfo',
  () =>
    function MockPolicyholderInfo(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="policyholder-info" {...domProps} />;
    }
);

jest.mock(
  './SaleInfo',
  () =>
    function MockSaleInfo(props: any) {
      const { extraFields, includeFields, ...domProps } = props;
      return (
        <div
          data-testid="sale-info"
          {...domProps}
          data-extra-fields={
            extraFields && extraFields.length > 0 ? 'true' : undefined
          }
        >
          {includeFields && (
            <div data-testid="include-fields">{includeFields.join(', ')}</div>
          )}
          {extraFields && extraFields.length > 0 && (
            <div data-testid="extra-fields">Extra fields present</div>
          )}
        </div>
      );
    }
);

jest.mock(
  'presentation/pages/health-insurance/leads/leadDetailsPage/common/component/Beneficiary',
  () => ({
    BeneficiarySection: function MockBeneficiarySection(props: any) {
      const { orderId: _orderId, ...domProps } = props;
      return <div data-testid="beneficiary-section" {...domProps} />;
    },
  })
);

jest.mock(
  'presentation/pages/health-insurance/leads/leadDetailsPage/common/component/PolicyHolderInformation',
  () =>
    function MockPolicyHolderInformation(props: any) {
      const {
        isFieldDisabled: _isFieldDisabled,
        isPartiallyDisabled: _isPartiallyDisabled,
        policyHolderType: _policyHolderType,
        ...domProps
      } = props;
      return <div data-testid="policy-holder-information" {...domProps} />;
    }
);

const mockStore = configureStore([]);

const defaultState = {
  order: {
    isFetching: false,
    success: true,
    payload: {
      id: 'orders/123',
      lead: 'leads/456',
      product: PRODUCTS.CAR_PRODUCT_INSURANCE,
      documentStatus: OrderDocumentStatus.PENDING,
      qcStatus: OrderQcStatus.PENDING,
      isCancelled: false,
      isFullyPaid: true,
      customer: {
        name: 'customers/789',
      },
    },
  },
  leadsDetailReducer: {
    emailReducer: {
      data: {
        unReadMails: 0,
      },
    },
  },
};

const defaultUser = {
  role: UserRoleID.SalesAgent,
};

const defaultLead = {
  name: 'leads/456',
  data: {
    policyHolder: {
      type: 'INDIVIDUAL',
    },
    insurance: {
      category: 'CAR',
    },
  },
};

const renderWithProviders = (
  component: React.ReactElement,
  initialState = defaultState
) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>{component}</HelmetProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('OrderPage', () => {
  const mockUseGetAuthenticateQuery =
    AuthSlice.useGetAuthenticateQuery as jest.Mock;
  const mockUseAppSelector = TypedHooks.useAppSelector as jest.Mock;
  const mockUseGetLeadSelector = LeadSelector.useGetLeadSelector as jest.Mock;
  const mockUseOrderComments = useOrderComments as jest.Mock;
  const mockCheckProductIsHealth =
    ProductOptions.checkProductIsHealth as jest.Mock;

  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockAddAndGetComment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlags([]);

    (useParams as jest.Mock).mockReturnValue({ orderId: '123' });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    mockUseGetAuthenticateQuery.mockReturnValue({ data: defaultUser });
    mockUseAppSelector.mockImplementation((selector: any) => {
      const state = {
        leadsDetailReducer: {
          emailReducer: {
            data: {
              unReadMails: 0,
            },
          },
        },
        order: {
          payload: defaultState.order.payload,
        },
      };
      return selector(state);
    });
    mockUseGetLeadSelector.mockReturnValue(defaultLead);
    mockUseOrderComments.mockReturnValue([mockAddAndGetComment]);
    mockCheckProductIsHealth.mockReturnValue(false);
  });

  describe('Loading and Error States', () => {
    it('shows loader when fetching', () => {
      const state = {
        ...defaultState,
        order: { ...defaultState.order, isFetching: true },
      };
      renderWithProviders(
        <OrderPage
          isFetching
          hasError={false}
          success={false}
          destroyModalSchedule={jest.fn()}
        />,
        state
      );
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows not found when there is an error', () => {
      const state = {
        ...defaultState,
        order: { ...defaultState.order, success: false },
      };
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError
          success={false}
          destroyModalSchedule={jest.fn()}
        />,
        state
      );
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('returns null when no lead name', () => {
      const state = {
        ...defaultState,
        order: {
          ...defaultState.order,
          payload: { ...defaultState.order.payload, lead: '' },
        },
      };
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 0,
              },
            },
          },
          order: {
            payload: state.order.payload,
          },
        };
        return selector(mockState);
      });

      const { container } = renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />,
        state
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('User Role Based Rendering', () => {
    it('shows admin-specific fields for admin users', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.Admin },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      const saleInfo = screen.getByTestId('sale-info');
      expect(saleInfo).toHaveAttribute('data-extra-fields');
    });

    it('hides admin-specific fields for non-admin users', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.SalesAgent },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      const saleInfo = screen.getByTestId('sale-info');
      expect(saleInfo).not.toHaveAttribute('data-extra-fields');
    });

    it('shows document buttons for docs agent', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.DocumentsCollection },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(
        screen.getByTestId('document-complete-button')
      ).toBeInTheDocument();
    });

    it('shows fix QC button for rejected orders with appropriate role', () => {
      const state = {
        ...defaultState,
        order: {
          ...defaultState.order,
          payload: {
            ...defaultState.order.payload,
            qcStatus: OrderQcStatus.REJECTED,
          },
        },
      };

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 0,
              },
            },
          },
          order: {
            payload: state.order.payload,
          },
        };
        return selector(mockState);
      });

      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.SalesAgent },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />,
        state
      );

      expect(screen.getByTestId('fix-qc-issues-btn')).toBeInTheDocument();
    });

    it('shows cancel button for users with cancel access', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.Admin },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(screen.getByTestId('cancel-order')).toBeInTheDocument();
    });
  });

  describe('Product Type Rendering', () => {
    it('renders car insurance components for car product', () => {
      mockCheckProductIsHealth.mockReturnValue(false);

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(screen.getByTestId('policyholder-info')).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-policy-section')).toBeInTheDocument();
    });

    it('renders health insurance components for health product', () => {
      const state = {
        ...defaultState,
        order: {
          ...defaultState.order,
          payload: {
            ...defaultState.order.payload,
            product: PRODUCTS.HEALTH_PRODUCT_INSURANCE,
          },
        },
      };

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 0,
              },
            },
          },
          order: {
            payload: state.order.payload,
          },
        };
        return selector(mockState);
      });

      mockCheckProductIsHealth.mockReturnValue(true);

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />,
        state
      );

      expect(
        screen.getByTestId('policy-holder-information')
      ).toBeInTheDocument();
      expect(screen.getByTestId('beneficiary-section')).toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('opens schedule modal when appointment button is clicked', () => {
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      fireEvent.click(screen.getByTestId('schedule-modal'));
      expect(screen.getByTestId('order-schedule-modal')).toBeInTheDocument();
    });

    it('opens message modal when message button is clicked', () => {
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      fireEvent.click(screen.getByText('text.message'));
      expect(screen.getByTestId('message-modal')).toBeInTheDocument();
    });

    it('opens comment modal when call ends', () => {
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      // Simulate call end
      fireEvent.click(screen.getByText('End Call'));
      expect(screen.getByTestId('common-modal')).toBeInTheDocument();
    });

    it('submits comment and closes modal', async () => {
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      // Open comment modal
      fireEvent.click(screen.getByText('End Call'));

      // Submit comment
      fireEvent.click(screen.getByText('Submit Comment'));

      await waitFor(() => {
        expect(mockAddAndGetComment).toHaveBeenCalledWith(
          { text: 'test comment', orderId: '123' },
          '123'
        );
      });

      // Modal should be closed
      expect(screen.queryByTestId('common-modal')).not.toBeInTheDocument();
    });
  });

  describe('Read-only States', () => {
    it('sets read-only for inbound agent', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.InboundAgent },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      const customerInfo = screen.getByTestId('customer-info');
      expect(customerInfo).toHaveAttribute('readOnly');
    });

    it('sets read-only for accounting agent', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({
        data: { role: UserRoleID.Accounting },
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      const customerInfo = screen.getByTestId('customer-info');
      expect(customerInfo).toHaveAttribute('readOnly');
    });

    it('sets read-only for cancelled orders', () => {
      const state = {
        ...defaultState,
        order: {
          ...defaultState.order,
          payload: {
            ...defaultState.order.payload,
            isCancelled: true,
          },
        },
      };

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 0,
              },
            },
          },
          order: {
            payload: state.order.payload,
          },
        };
        return selector(mockState);
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />,
        state
      );

      const customerInfo = screen.getByTestId('customer-info');
      expect(customerInfo).toHaveAttribute('readOnly');
    });
  });

  describe('useEffect Behaviors', () => {
    it('dispatches order detail action on mount', () => {
      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'GET_DETAIL',
        payload: {
          orderName: 'orders/123',
          isFetchCarDetails: false,
        },
      });
    });

    it('handles health order document status change', () => {
      mockCheckProductIsHealth.mockReturnValue(true);

      // Test wrapper to simulate Redux state change
      function TestWrapper() {
        const [documentStatus, setDocumentStatus] = React.useState(
          OrderDocumentStatus.PENDING
        );
        // Mock selector to return current status
        mockUseAppSelector.mockImplementation((selector: any) => {
          const mockState = {
            leadsDetailReducer: {
              emailReducer: {
                data: {
                  unReadMails: 0,
                },
              },
            },
            order: {
              payload: {
                ...defaultState.order.payload,
                product: PRODUCTS.HEALTH_PRODUCT_INSURANCE,
                documentStatus,
              },
            },
          };
          return selector(mockState);
        });
        return (
          <>
            <OrderPage
              isFetching={false}
              hasError={false}
              success
              destroyModalSchedule={jest.fn()}
            />
            <button
              type="button"
              onClick={() => setDocumentStatus(OrderDocumentStatus.COMPLETE)}
            >
              Set Complete
            </button>
          </>
        );
      }

      renderWithProviders(<TestWrapper />, defaultState);
      // Change the status to COMPLETE and trigger effect
      fireEvent.click(screen.getByText('Set Complete'));
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('updates message read status based on unread count', () => {
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 5,
              },
            },
          },
          order: {
            payload: defaultState.order.payload,
          },
        };
        return selector(mockState);
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      // The component should handle the unread count internally
      expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing order detail gracefully', () => {
      const state = {
        ...defaultState,
        order: {
          ...defaultState.order,
          payload: {
            id: 'orders/123',
            lead: 'leads/456',
            product: PRODUCTS.CAR_PRODUCT_INSURANCE,
            documentStatus: OrderDocumentStatus.PENDING,
            qcStatus: OrderQcStatus.PENDING,
            isCancelled: false,
            isFullyPaid: true,
            customer: {
              name: 'customers/789',
            },
          },
        },
      };

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            emailReducer: {
              data: {
                unReadMails: 0,
              },
            },
          },
          order: {
            payload: state.order.payload,
          },
        };
        return selector(mockState);
      });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />,
        state
      );

      expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
    });

    it('handles missing lead data gracefully', () => {
      mockUseGetLeadSelector.mockReturnValue(null);

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
    });

    it('handles missing user data gracefully', () => {
      mockUseGetAuthenticateQuery.mockReturnValue({ data: null });

      renderWithProviders(
        <OrderPage
          isFetching={false}
          hasError={false}
          success
          destroyModalSchedule={jest.fn()}
        />
      );

      expect(screen.getByTestId('order-detail-page')).toBeInTheDocument();
    });
  });
});
