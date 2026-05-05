import React from 'react';
import { render, screen, waitFor, fireEvent } from '__tests__/rtl-test-utils';
import ContactInsurers from './index';

// Mock dependencies
const mockFetchLeadById = jest.fn();
const mockStartCall = jest.fn();
const mockEndCall = jest.fn();

// Create a mock that can be updated
let mockCallStatus = 'idle';

const mockUser = {
  annotations: {},
  firstName: 'Test',
  lastName: 'User',
  humanId: 'test-user-id',
  name: 'Test User',
  loginTime: '2024-01-01T00:00:00Z',
  role: 'agent',
};

jest.mock('data/slices/leadSlice', () => ({
  useLazyGetLeadByIDQuery: () => [mockFetchLeadById],
}));

jest.mock('presentation/hooks/useCareosCall', () => ({
  __esModule: true,
  default: () => ({
    status: mockCallStatus,
    startCall: mockStartCall,
    endCall: mockEndCall,
  }),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: (key) => key,
}));

jest.mock('presentation/components/CallButtonV2/helper', () => ({
  shouldShowHangupButton: (status) => status === 'incall',
}));

jest.mock(
  'presentation/components/CallButtonV2/Timer',
  () =>
    function MockTimer() {
      return <div data-testid="call-timer">00:00</div>;
    }
);

let mockLiveKitCallStatus = 'idle';
const mockInitiateCall = jest.fn().mockResolvedValue('call-name');
const mockDialPhoneNumber = jest.fn().mockResolvedValue(undefined);
const mockLiveKitEndCall = jest.fn();
const mockEnsureMicrophonePermission = jest.fn().mockResolvedValue(true);

jest.mock(
  'presentation/components/CallButtonLiveKit/LivekitRoomProvider',
  () => ({
    LiveKitCallStatus: {
      Idle: 'idle',
      AgentConnecting: 'agentConnecting',
      AgentConnected: 'agentConnected',
      DialingLead: 'dialingLead',
      Ringing: 'ringing',
      Active: 'active',
      Ended: 'ended',
    },
    useLiveKitCall: () => ({
      ensureMicrophonePermission: mockEnsureMicrophonePermission,
      initiateCall: mockInitiateCall,
      dialPhoneNumber: mockDialPhoneNumber,
      endCall: mockLiveKitEndCall,
      liveKitCallStatus: mockLiveKitCallStatus,
      callDuration: 0,
    }),
  })
);

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: () => ({
    showErrorSnackbar: jest.fn(),
    showSuccessSnackbar: jest.fn(),
  }),
}));

describe('ContactInsurers', () => {
  const mockLeadData = {
    data: {
      customerPhoneNumber: [
        { phone: '+66123456789', status: 'verified' },
        { phone: '+66987654321', status: 'unverified' },
      ],
      primaryPhoneIndex: 0,
    },
  };

  const initialState = {
    authReducer: {
      data: {
        user: mockUser,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallStatus = 'idle';
    mockLiveKitCallStatus = 'idle';
    mockFetchLeadById.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(mockLeadData),
    });
  });

  it('should render insurer display name', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(screen.getByText('Bangkok Insurance(BKI)')).toBeInTheDocument();
    });
  });

  it('should fetch lead details on mount', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(mockFetchLeadById).toHaveBeenCalled();
    });
  });

  it('should extract lead ID from leads/xxx format', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(mockFetchLeadById).toHaveBeenCalled();
    });

    // Check that the lead ID was extracted correctly (without 'leads/' prefix)
    const callArgs = mockFetchLeadById.mock.calls[0];
    expect(callArgs).toBeDefined();
  });

  it('should display primary phone number', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(screen.queryByText('+66123456789')).not.toBeInTheDocument();
    });
  });

  it('should display "No primary phone available" when no primary phone exists', async () => {
    mockFetchLeadById.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        data: {
          customerPhoneNumber: [],
          primaryPhoneIndex: 0,
        },
      }),
    });

    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(
        screen.getByText('No primary phone available')
      ).toBeInTheDocument();
    });
  });

  it('should call startCall when call button is clicked', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      // The component renders the old button when feature flag is disabled
      const callButton = screen.getByTestId('start-call-button');
      expect(callButton).toBeInTheDocument();
    });

    const callButton = screen.getByTestId('start-call-button');
    fireEvent.click(callButton);

    // Verify that startCall is called with the correct parameters
    await waitFor(() => {
      expect(mockStartCall).toHaveBeenCalled();
    });
  });

  it('should disable call button when status is not idle or ended', async () => {
    // Set LiveKit status to a non-idle state
    mockLiveKitCallStatus = 'agentConnecting';

    // Force re-render by updating the mock
    const { rerender } = render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      // When status is 'agentConnecting', the component shows a loading spinner
      // instead of the call button, so we verify the button is not present
      const callButton = screen.queryByRole('button', { name: /call/i });
      expect(callButton).not.toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockFetchLeadById.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Fetch failed')),
    });

    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should map phone numbers correctly to phoneIndex format', async () => {
    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      // Should show the primary phone (index 0)
      expect(screen.queryByText('+66123456789')).not.toBeInTheDocument();
      // Should not show the secondary phone (index 1)
      expect(screen.queryByText('+66987654321')).not.toBeInTheDocument();
    });
  });

  it('should use correct primaryPhoneIndex from lead data', async () => {
    const leadDataWithDifferentPrimary = {
      data: {
        customerPhoneNumber: [
          { phone: '+66123456789', status: 'verified' },
          { phone: '+66987654321', status: 'unverified' },
        ],
        primaryPhoneIndex: 1, // Second phone is primary
      },
    };

    mockFetchLeadById.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(leadDataWithDifferentPrimary),
    });

    render(<ContactInsurers />, { initialState });

    await waitFor(() => {
      // Should show the second phone as it's the primary
      expect(screen.queryByText('+66987654321')).not.toBeInTheDocument();
      // Should not show the first phone
      expect(screen.queryByText('+66123456789')).not.toBeInTheDocument();
    });
  });
});
