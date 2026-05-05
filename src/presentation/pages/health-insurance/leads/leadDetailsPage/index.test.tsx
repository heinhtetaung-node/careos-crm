import React from 'react';
import { Observable } from 'rxjs';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import { LeadPage } from '.';

let mockPitchChecklistFlagEnabled = false;

const buildInitialState = (overrides: any = {}) => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/health-lead-1',
        product: 'products/health-insurance',
        humanId: 'L0000001',
        status: 'LEAD_STATUS_NEW',
        isRejected: false,
        data: {
          customerFirstName: 'First',
          customerLastName: 'Last',
          locale: 'th-th',
          insuranceKind: 'voluntary',
          voluntaryInsuranceType: [],
          customerPolicyAddress: [],
          customerBillingAddress: [],
          customerShippingAddress: [],
          customerEmail: [],
          customerPhoneNumber: [],
        },
      },
      success: true,
      error: 'forced-error-to-short-circuit-render',
      isFetching: false,
      ...overrides.lead,
    },
    callReducer: {
      data: {
        callStatus: 0,
      },
    },
    getListInsurerReducer: {
      data: { listInsurer: { insurers: [] } },
      isLoading: false,
    },
    ...overrides.rest,
  },
});

const mockWs = new Observable((subscriber) =>
  subscriber.next({ body: { createBy: '' }, name: '' })
);

jest.mock('data/gateway/websocket', () => ({
  getInstance: jest.fn().mockReturnValue({
    subscribe: () => mockWs,
    getWs: () => null,
  }),
}));

jest.mock('config/feature-flags', () => ({
  ...jest.requireActual('config/feature-flags'),
  websocketEnabled: false,
}));

jest.mock('presentation/redux/actions/leadDetail/getLeadByName', () => ({
  ...jest.requireActual('presentation/redux/actions/leadDetail/getLeadByName'),
  getLead: jest.fn().mockReturnValue({ type: 'Dummy Action' }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: 'health-lead-1' }),
  useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '' }),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn().mockReturnValue({
    data: {
      name: 'users/be61ecdf-9a1e-4722-bbb2-8bcb063a3844',
      humanId: 'hxan619@gmail.com',
      role: 'roles/admin',
      firstName: 'Test',
      lastName: 'User',
      annotations: {},
    },
  }),
}));

jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useGetConnectedLeadsQuery: jest.fn().mockReturnValue({
    data: { leads: [], customer: null, hasLead: false },
    isLoading: false,
    refetch: jest.fn(),
  }),
  useGetUserFromPhoneNumberQuery: jest.fn().mockReturnValue({ data: [] }),
  useCreateCustomerEmailMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false }]),
  useCreatePhoneNumberMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false }]),
  useLazyGetCustomerEmailQuery: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false, data: undefined }]),
  useLazyGetCustomerPhoneNumberQuery: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false, data: undefined }]),
  useLazyGetCustomerQuery: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false, data: undefined }]),
}));

jest.mock('data/slices/rejectionSlice', () => ({
  ...jest.requireActual('data/slices/rejectionSlice'),
  useGetLeadRejectionByIdQuery: jest.fn().mockReturnValue({
    data: null,
    error: undefined,
  }),
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/Hooks/useUpdate',
  () => ({
    useUpdateCustomer: jest.fn().mockReturnValue([jest.fn()]),
  })
);

jest.mock('./common/hook/useUpdateUnderwriting', () => ({
  useUpdateUnderwritingStatus: jest
    .fn()
    .mockReturnValue({ getStatus: jest.fn(), status: undefined }),
}));

jest.mock('utils/snackbar', () =>
  jest.fn().mockReturnValue({ showErrorSnackbar: jest.fn() })
);

jest.mock('data/gateway/api/services/assign', () =>
  jest.fn(() => ({
    getAssignment: () => new Observable((sub) => sub.next({ data: {} })),
  }))
);

jest.mock('data/gateway/api/services/user', () =>
  jest.fn(() => ({
    getUser: () => new Observable((sub) => sub.next({ data: {} })),
  }))
);

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() => ({
    [require('config/flagsmithConfig').default
      .BROK_5648_ENABLE_LEAD_PITCH_CHECKLIST_20260417_TEMP]: {
      enabled: mockPitchChecklistFlagEnabled,
    },
  })),
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/LeadDetailsComponents/leadDetailsHeader',
  () => ({
    __esModule: true,
    default: () => <div data-testid="mock-lead-details-header" />,
  })
);

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/LeadDetailsComponents/leadDetailsModals',
  () => ({
    __esModule: true,
    default: () => <div data-testid="mock-lead-details-modals" />,
  })
);

jest.mock(
  'presentation/pages/health-insurance/leads/leadDetailsPage/common/LeadDetailsSection',
  () => ({
    __esModule: true,
    default: () => <div data-testid="mock-lead-details-sections" />,
  })
);

jest.mock('presentation/components/PitchChecklistPanel', () => ({
  __esModule: true,
  default: (props: {
    leadName?: string;
    isEditable?: boolean;
    isExpanded?: boolean;
    onToggle?: (next: boolean) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-pitch-checklist-panel"
      data-lead-name={props.leadName ?? ''}
      data-is-editable={String(props.isEditable)}
      data-is-expanded={String(props.isExpanded)}
      onClick={() => props.onToggle?.(!props.isExpanded)}
    />
  ),
}));

const buildSuccessState = () => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/health-lead-1',
        product: 'products/health-insurance',
        humanId: 'L0000001',
        status: 'LEAD_STATUS_NEW',
        isRejected: false,
        data: {
          customerFirstName: 'First',
          customerLastName: 'Last',
          locale: 'th-th',
          insuranceKind: 'voluntary',
          voluntaryInsuranceType: [],
          customerPolicyAddress: [],
          customerBillingAddress: [],
          customerShippingAddress: [],
          customerEmail: [],
          customerPhoneNumber: [],
        },
      },
      success: true,
      error: null,
      isFetching: false,
    },
    callReducer: { data: { callStatus: 0 } },
    getListInsurerReducer: {
      data: { listInsurer: { insurers: [] } },
      isLoading: false,
    },
  },
});

describe('health-insurance LeadPage', () => {
  beforeEach(() => {
    mockPitchChecklistFlagEnabled = false;
  });

  it('renders NotFound when the lead has an error (smoke test covering state init + pitch checklist hook wiring)', async () => {
    render(<LeadPage />, { initialState: buildInitialState() });

    await waitFor(() => {
      expect(screen.getByTestId('not-found-wrapper')).toBeInTheDocument();
    });
  });

  it('renders PitchChecklistPanel with forwarded props when the feature flag is enabled', async () => {
    mockPitchChecklistFlagEnabled = true;

    render(<LeadPage />, { initialState: buildSuccessState() });

    const panel = await screen.findByTestId('mock-pitch-checklist-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('data-lead-name', 'leads/health-lead-1');
    expect(panel).toHaveAttribute('data-is-expanded', 'false');

    panel.click();

    await waitFor(() => {
      expect(
        screen.getByTestId('mock-pitch-checklist-panel')
      ).toHaveAttribute('data-is-expanded', 'true');
    });
  });

  it('does not render PitchChecklistPanel when the feature flag is disabled', async () => {
    mockPitchChecklistFlagEnabled = false;

    render(<LeadPage />, { initialState: buildSuccessState() });

    await screen.findByTestId('mock-lead-details-sections');
    expect(
      screen.queryByTestId('mock-pitch-checklist-panel')
    ).not.toBeInTheDocument();
  });
});
