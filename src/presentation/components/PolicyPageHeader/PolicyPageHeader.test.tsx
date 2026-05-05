import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { OrderPolicy } from 'data/slices/orderPolicySlice/interface';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import FeatureFlags from 'config/flagsmithConfig';

import PolicyPageHeader from './PolicyPageHeader';

const setShowCommentModal = jest.fn();

jest.mock('presentation/components/CallButtonLiveKit', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-livekit">CallButtonLiveKit</div>,
}));

jest.mock('presentation/components/CallButtonV2', () => ({
  __esModule: true,
  default: () => <div data-testid="call-button-v2">CallButtonV2</div>,
}));

// Store for mock return values that can be updated per test
const mockFlagsValue: Record<string, any> = {};

jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn(() => mockFlagsValue),
  FlagsmithProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn((selector: any) => {
    const mockState = {
      order: {
        payload: {
          lead: 'leads/test-lead',
          customer: 'customers/test-customer',
        },
      },
    };
    return selector(mockState);
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
}));

test('Render PolicyPageHeader with approval buttons', async () => {
  Object.assign(mockFlagsValue, {
    [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
      enabled: false,
    },
  });

  render(
    <PolicyPageHeader
      orderId="order-123"
      showPolicyButtons
      policy={OrderDetail as unknown as OrderPolicy}
      fieldsErrors={{}}
      setShowCommentModal={setShowCommentModal}
    />
  );
  await waitFor(() => {
    expect(screen.getByTestId('approval-text-button')).toBeInTheDocument();
  });
});

describe('CallButtonLiveKit Feature Flag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the mock flags value before each test
    Object.keys(mockFlagsValue).forEach((key) => {
      delete mockFlagsValue[key];
    });
  });

  it('should render CallButtonLiveKit when feature flag is enabled', async () => {
    Object.assign(mockFlagsValue, {
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: true,
      },
    });

    render(
      <PolicyPageHeader
        orderId="order-123"
        showPolicyButtons={false}
        policy={OrderDetail as unknown as OrderPolicy}
        fieldsErrors={{}}
        setShowCommentModal={setShowCommentModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('call-button-livekit')).toBeInTheDocument();
    });
  });

  it('should render CallButtonV2 when feature flag is disabled', async () => {
    Object.assign(mockFlagsValue, {
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
    });

    render(
      <PolicyPageHeader
        orderId="order-123"
        showPolicyButtons={false}
        policy={OrderDetail as unknown as OrderPolicy}
        fieldsErrors={{}}
        setShowCommentModal={setShowCommentModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('call-button-v2')).toBeInTheDocument();
    });
  });

  it('should display order human ID correctly', async () => {
    Object.assign(mockFlagsValue, {
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
    });

    const policyWithHumanId = {
      ...OrderDetail,
      order: {
        ...OrderDetail.order,
        humanId: 'TEST123',
      },
    };

    render(
      <PolicyPageHeader
        orderId="order-123"
        showPolicyButtons={false}
        policy={policyWithHumanId as unknown as OrderPolicy}
        fieldsErrors={{}}
        setShowCommentModal={setShowCommentModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-id')).toHaveTextContent('#TEST123');
    });
  });

  it('should display policyholder name when showPolicyholderName is true', async () => {
    Object.assign(mockFlagsValue, {
      [FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]: {
        enabled: false,
      },
    });

    const policyWithPolicyholder = {
      ...OrderDetail,
      order: {
        ...OrderDetail.order,
        humanId: 'TEST123',
      },
      policyHolderName: 'John Doe',
    };

    render(
      <PolicyPageHeader
        orderId="order-123"
        showPolicyButtons={false}
        showPolicyholderName
        policy={policyWithPolicyholder as unknown as OrderPolicy}
        fieldsErrors={{}}
        setShowCommentModal={setShowCommentModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-id')).toHaveTextContent(
        '#TEST123(John Doe)'
      );
    });
  });
});
