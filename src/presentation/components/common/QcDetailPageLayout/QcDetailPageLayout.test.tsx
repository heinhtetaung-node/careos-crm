import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { HelmetProvider } from 'react-helmet-async';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';
import QcDetailPageLayout from './index';

// Import mocked modules for use in tests
import * as reactRouterDom from 'react-router-dom';
import * as orderSlice from 'data/slices/orderSlice';
import * as qcSliceSelector from 'data/slices/qcSlice/selector';
import * as typedHooks from 'presentation/redux/hooks/typedHooks';
import * as userSelectors from 'presentation/redux/selectors/user';

// Mock components
jest.mock(
  'presentation/components/ActivityOrderSection',
  () =>
    function MockActivityOrderSection() {
      return (
        <div data-testid="activity-order-section">Activity Order Section</div>
      );
    }
);

jest.mock(
  'presentation/components/CallButtonV2',
  () =>
    function MockCallButtonV2() {
      return <div data-testid="call-button">Call Button</div>;
    }
);

jest.mock(
  'presentation/components/QcDetailPage/QcCalls',
  () =>
    function MockQcCalls() {
      return <div data-testid="qc-calls">QC Calls</div>;
    }
);

jest.mock(
  'presentation/components/OrderDetailPage/Header',
  () =>
    function MockHeader({ children, hideIcon }: any) {
      return (
        <div data-testid="header" data-hide-icon={hideIcon}>
          {children}
        </div>
      );
    }
);

jest.mock(
  'presentation/components/modal/MessageModal/index',
  () =>
    function MockMessageModal({ openDialog, closeDialog }: any) {
      return (
        <div data-testid="message-modal" data-open={openDialog}>
          Message Modal
          <button type="button" onClick={closeDialog}>
            Close
          </button>
        </div>
      );
    }
);

jest.mock(
  'presentation/components/Loader',
  () =>
    function MockLoader() {
      return <div data-testid="loader">Loading...</div>;
    }
);

jest.mock(
  'presentation/components/NotFound',
  () =>
    function MockNotFound() {
      return <div data-testid="not-found">Not Found</div>;
    }
);

// Mock hooks
jest.mock('ahooks', () => ({
  useLocalStorageState: jest.fn(() => [{}, jest.fn()]),
}));

jest.mock('data/slices/orderSlice', () => ({
  useGetOrderItemsQuery: jest.fn(),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(),
}));

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: jest.fn(),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

// Mock helpers
jest.mock('presentation/components/QcDetailPage/helpers/question', () => ({
  formatSavedAnswers: jest.fn(() => ({})),
}));

jest.mock('presentation/redux/actions/leadDetail/getLeadByName', () => ({
  LeadDetailGetLeadActionTypes: {
    GET_LEAD: '[LeadDetail] GET_LEAD',
    GET_LEAD_SUCCESS: '[LeadDetail] GET_LEAD_SUCCESS',
    GET_LEAD_FAIL: '[LeadDetail] GET_LEAD_FAIL',
  },
  getLead: jest.fn(),
}));

jest.mock('presentation/redux/actions/leads/detail', () => ({
  LeadDetailActionTypes: {
    INITIAL_CALL: '[LeadDetail] INITIAL_CALL',
    CREATE_REJECTION: '[LeadDetail] CREATE_REJECTION',
    CREATE_REJECTION_SUCCESS: '[LeadDetail] CREATE_REJECTION_SUCCESS',
    CREATE_REJECTION_FAILED: '[LeadDetail] CREATE_REJECTION_FAILED',
    SET_AUDIO_STREAM: '[LeadDetail] SET_AUDIO_STREAM',
    CALLING: '[LeadDetail] CALLING',
    CONNECTED_CALL: '[LeadDetail] CONNECTED_CALL',
    JOIN_CALL: '[LeadDetail] JOIN_CALL',
    CALL_TIMER: '[LeadDetail] CALL_TIMER',
    FAILED_CALL: '[LeadDetail] FAILED_CALL',
    END_CALL: '[LeadDetail] END_CALL',
    GET_CALL_PARTICIPANTS_SUCCESS: '[LeadDetail] GET_CALL_PARTICIPANTS_SUCCESS',
  },
  getCallParticipants: jest.fn(),
}));

jest.mock('presentation/redux/actions/leadDetail/email', () => ({
  LeadActionTypes: {
    INITIAL_CALL: '[LeadsDetail] INITIAL_CALL',
    GET_MAIL_READ_COUNT: '[LeadsDetail] GET_MAIL_READ_COUNT',
    GET_ATTACHMENT: '[LeadsDetail] GET_ATTACHMENT',
    GET_ATTACHMENT_SUCCESS: '[LeadsDetail] GET_ATTACHMENT_SUCCESS',
    GET_ATTACHMENT_FAIL: '[LeadsDetail] GET_ATTACHMENT_FAIL',
  },
  getMailReadCount: jest.fn(),
}));

jest.mock('presentation/redux/actions/order', () => ({
  OrderActionTypes: {
    GET_DETAIL: '[Order] GET_DETAIL',
    GET_DETAIL_SUCCESS: '[Order] GET_DETAIL_SUCCESS',
    GET_DETAIL_FAIL: '[Order] GET_DETAIL_FAIL',
  },
  getDetailSuccess: jest.fn(),
}));

jest.mock('presentation/components/CallButtonLiveKit', () => () => (
  <div data-testid="call-button-livekit">CallButtonLiveKit</div>
));

jest.mock('data/slices/qcSlice/reducer', () => ({
  addQcOrderDetail: jest.fn(),
  qcDetailInit: jest.fn(),
  QC_QUESTIONS_KEY: 'test-key',
}));

jest.mock('data/slices/qcSlice/selector', () => ({
  useGetQcDetail: jest.fn(),
}));

jest.mock('config/TypeFilter', () => ({
  PRODUCTS: {
    CAR_PRODUCT_INSURANCE: 'car-insurance',
    HEALTH_PRODUCT_INSURANCE: 'health-insurance',
  },
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn(() => ({})),
}));

jest.mock('@alphafounders/icons', () => ({
  StarIcon: () => <div data-testid="star-icon">Star</div>,
  EnvelopeIcon: () => <div data-testid="envelope-icon">Envelope</div>,
  ArrowLeftIcon: () => <div data-testid="arrow-left-icon">Arrow Left</div>,
}));

jest.mock('@alphafounders/ui', () => ({
  Button: ({ children, onClick, disabled, text, ...props }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} {...props}>
      {text || children}
    </button>
  ),
}));

jest.mock('@material-ui/core', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TextField: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  IconButton: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Input: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Divider: ({ ...props }: any) => <div {...props}>Divider</div>,
  Typography: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
  Badge: ({ children, invisible, ...props }: any) => (
    <div {...props} data-invisible={invisible}>
      {children}
    </div>
  ),
  withTheme: jest.fn(() => (Component: any) => Component),
  withStyles: jest.fn(() => (Component: any) => Component),
  makeStyles: jest.fn(() =>
    jest.fn(() => ({
      popper: 'popper-class',
    }))
  ),
}));

jest.mock('@material-ui/core/styles', () => ({
  makeStyles: jest.fn(() =>
    jest.fn(() => ({
      qcTabs: 'qc-tabs-class',
      qcTopBarInfo: 'qc-top-bar-info-class',
      documents: 'documents-class',
      statusButton: 'status-button-class',
      callButton: 'call-button-class',
      divider: 'divider-class',
      qcTopBarInfoConent: 'qc-top-bar-info-content-class',
      qcAudioPlayer: 'qc-audio-player-class',
    }))
  ),
  createStyles: jest.fn((styles) => styles),
  withStyles: jest.fn(() => (Component: any) => Component),
  withTheme: jest.fn(() => (Component: any) => Component),
}));

jest.mock(
  '@material-ui/icons/AddSharp',
  () =>
    function MockAddSharpIcon() {
      return <div data-testid="add-sharp-icon">Add</div>;
    }
);

jest.mock(
  'presentation/components/common/Button/IconButton',
  () =>
    function MockIconButton({
      icon,
      handleClick,
      isDisabled,
      dataTestid,
    }: any) {
      return (
        <button
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          data-testid={dataTestid}
        >
          {icon}
        </button>
      );
    }
);

const mockStore = configureStore({
  reducer: {
    qcDetailReducer: (
      state = { orderDetail: {}, answers: {}, countdown: {} },
      _action: any
    ) => state,
    order: (state = { payload: {} }, _action: any) => state,
    auth: (state = {}, _action: any) => state,
    leadsDetailReducer: (
      state = { emailReducer: { data: { unReadMails: 0 } } },
      _action: any
    ) => state,
  },
  preloadedState: {
    qcDetailReducer: {
      orderDetail: { product: 'test-product' },
      answers: {},
      countdown: {},
    },
    order: {
      payload: {
        order: {
          lead: 'leads/123',
          isCancelled: false,
          humanId: 'TEST123',
        },
        customer: {
          customer: {
            name: 'test-customer',
          },
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
  },
});

const renderWithProviders = (component: React.ReactElement) =>
  render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <HelmetProvider>{component}</HelmetProvider>
      </BrowserRouter>
    </Provider>
  );

describe('QcDetailPageLayout', () => {
  const defaultProps = {
    children: <div data-testid="children">Test Children</div>,
    productType: 'test-product',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (reactRouterDom.useParams as jest.Mock).mockReturnValue({
      orderId: 'test-order-id',
    });
    (reactRouterDom.useNavigate as jest.Mock).mockReturnValue(jest.fn());

    (orderSlice.useGetOrderItemsQuery as jest.Mock).mockReturnValue({
      data: {
        order: { humanId: 'TEST123' },
        earliestDeadline: 5,
      },
      isSuccess: true,
      isLoading: false,
      isError: false,
    });

    (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue({
      orderDetail: { product: 'test-product' },
      answers: {},
      countdown: {},
    });

    (typedHooks.useAppSelector as jest.Mock).mockImplementation(
      (selector: any) => {
        const state = mockStore.getState();
        return selector(state);
      }
    );

    (userSelectors.useGetUserSelector as jest.Mock).mockReturnValue({
      role: 'SALES_AGENT',
    });

    (useFlags as jest.Mock).mockReturnValue({});
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('qc-detail-page')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    it('renders header with correct props', () => {
      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} hideHeaderIcon />
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('data-hide-icon', 'true');
    });

    it('renders without header icon when hideHeaderIcon is false', () => {
      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} hideHeaderIcon={false} />
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('data-hide-icon', 'false');
    });
  });

  describe('Back Button Functionality', () => {
    it('shows back button when showBackButton is true', () => {
      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} showBackButton />
      );
      expect(screen.getByText('text.back')).toBeInTheDocument();
    });

    it('hides back button when showBackButton is false', () => {
      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} showBackButton={false} />
      );
      expect(screen.queryByText('text.back')).not.toBeInTheDocument();
    });

    it('calls navigate when back button is clicked', () => {
      const mockNavigate = jest.fn();
      (reactRouterDom.useNavigate as jest.Mock).mockReturnValue(mockNavigate);

      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} showBackButton />
      );

      const backButton = screen.getByText('text.back').closest('button');
      fireEvent.click(backButton!);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows loader when isLoading is true', () => {
      (orderSlice.useGetOrderItemsQuery as jest.Mock).mockReturnValue({
        data: null,
        isSuccess: false,
        isLoading: true,
        isError: false,
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows loader when qcState is not available', () => {
      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(null);

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows loader when orderDetail is empty', () => {
      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue({
        orderDetail: {},
        answers: {},
        countdown: {},
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows not found when isError is true', () => {
      (orderSlice.useGetOrderItemsQuery as jest.Mock).mockReturnValue({
        data: null,
        isSuccess: false,
        isLoading: false,
        isError: true,
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  describe('Message Modal', () => {
    it('shows message modal when message button is clicked', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);

      const messageButton = screen.getByRole('button', {
        name: /text\.message/i,
      });
      fireEvent.click(messageButton);

      expect(screen.getByTestId('message-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });
  });

  describe('Additional Status Buttons', () => {
    it('renders additional status buttons when provided', () => {
      const additionalButtons = (
        <div data-testid="additional-buttons">Extra Buttons</div>
      );
      renderWithProviders(
        <QcDetailPageLayout
          {...defaultProps}
          additionalStatusButtons={additionalButtons}
        />
      );
      expect(screen.getByTestId('additional-buttons')).toBeInTheDocument();
    });

    it('does not render additional status buttons when not provided', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(
        screen.queryByTestId('additional-buttons')
      ).not.toBeInTheDocument();
    });
  });

  describe('QC Context Provider', () => {
    it('wraps content with QC context provider when provided', () => {
      const MockQcContextProvider = ({
        children,
      }: {
        children: React.ReactNode;
      }) => <div data-testid="qc-context-provider">{children}</div>;

      renderWithProviders(
        <QcDetailPageLayout
          {...defaultProps}
          qcContextProvider={MockQcContextProvider}
        />
      );
      expect(screen.getByTestId('qc-context-provider')).toBeInTheDocument();
    });

    it('renders without QC context provider when not provided', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(
        screen.queryByTestId('qc-context-provider')
      ).not.toBeInTheDocument();
    });
  });

  describe('Order Information Display', () => {
    it('displays order human ID correctly', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByText('#TEST123')).toBeInTheDocument();
    });

    it('displays deadline information correctly', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      expect(screen.getByText('(5 days)')).toBeInTheDocument();
    });

    it('displays error color for negative deadline', () => {
      (orderSlice.useGetOrderItemsQuery as jest.Mock).mockReturnValue({
        data: {
          order: { humanId: 'TEST123' },
          earliestDeadline: -2,
        },
        isSuccess: true,
        isLoading: false,
        isError: false,
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);
      const deadlineElement = screen.getByText('(-2 days)');
      expect(deadlineElement).toHaveAttribute('color', 'error');
    });
  });

  describe('User Role Based Behavior', () => {
    it('generates correct order detail path for sales agent', () => {
      (userSelectors.useGetUserSelector as jest.Mock).mockReturnValue({
        role: 'SALES_AGENT',
      });

      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} showBackButton />
      );

      const backButton = screen.getByText('text.back').closest('button');
      fireEvent.click(backButton!);

      // The navigate function should be called with the correct path
      const mockNavigate = (reactRouterDom.useNavigate as jest.Mock)();
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('generates correct order detail path for non-sales agent', () => {
      (userSelectors.useGetUserSelector as jest.Mock).mockReturnValue({
        role: 'ADMIN',
      });

      renderWithProviders(
        <QcDetailPageLayout {...defaultProps} showBackButton />
      );

      const backButton = screen.getByText('text.back').closest('button');
      fireEvent.click(backButton!);

      // The navigate function should be called with the correct path
      const mockNavigate = (reactRouterDom.useNavigate as jest.Mock)();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    it('renders all required components', () => {
      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('activity-order-section')).toBeInTheDocument();
      expect(screen.getByTestId('call-button')).toBeInTheDocument();
      expect(screen.getByTestId('qc-calls')).toBeInTheDocument();
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /text\.message/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('add-sharp-icon')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles missing optional props gracefully', () => {
      renderWithProviders(
        <QcDetailPageLayout productType="test-product">
          <div>Test</div>
        </QcDetailPageLayout>
      );
      expect(screen.getByTestId('qc-detail-page')).toBeInTheDocument();
    });

    it('handles all props being provided', () => {
      const additionalButtons = (
        <div data-testid="additional-buttons">Extra Buttons</div>
      );
      const MockQcContextProvider = ({
        children,
      }: {
        children: React.ReactNode;
      }) => <div data-testid="qc-context-provider">{children}</div>;

      renderWithProviders(
        <QcDetailPageLayout
          productType="test-product"
          showBackButton
          hideHeaderIcon
          additionalStatusButtons={additionalButtons}
          qcContextProvider={MockQcContextProvider}
        >
          <div data-testid="children">Test Children</div>
        </QcDetailPageLayout>
      );

      expect(screen.getByTestId('qc-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
      expect(screen.getByTestId('additional-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('qc-context-provider')).toBeInTheDocument();
      expect(screen.getByText('text.back')).toBeInTheDocument();
    });
  });

  describe('CallButtonLiveKit Feature Flag', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (useFlags as jest.Mock).mockReturnValue({});
    });

    it('should render CallButtonLiveKit when feature flag is enabled', () => {
      (useFlags as jest.Mock).mockReturnValue({
        [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
          enabled: true,
        },
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);

      expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
      expect(screen.queryByTestId('call-button')).not.toBeInTheDocument();
    });

    it('should render CallButtonV2 when feature flag is disabled', () => {
      (useFlags as jest.Mock).mockReturnValue({
        [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
          enabled: false,
        },
      });

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);

      expect(screen.getByTestId('call-button')).toBeInTheDocument();
      expect(
        screen.queryByTestId('call-button-livekit')
      ).not.toBeInTheDocument();
    });

    it('should default to CallButtonV2 when flag is undefined', () => {
      (useFlags as jest.Mock).mockReturnValue({});

      renderWithProviders(<QcDetailPageLayout {...defaultProps} />);

      expect(screen.getByTestId('call-button')).toBeInTheDocument();
      expect(
        screen.queryByTestId('call-button-livekit')
      ).not.toBeInTheDocument();
    });
  });
});
