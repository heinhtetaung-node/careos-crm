import { useConnectionState } from '@livekit/components-react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '__tests__/rtl-test-utils';
import { ConnectionState } from 'livekit-client';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import React from 'react';
import { PhoneNumber } from 'shared/types/customer';
import useSnackbar from 'utils/snackbar';
import usePhoneNumbers from '../CallButton/hooks/usePhoneNumbers';
import useAddPhone from '../modal/LeadDetailsModal/PhoneModal/useAddPhone';
import CallButtonLiveKit from './index';
import { LiveKitCallStatus } from './LivekitRoomProvider';

jest.mock('@livekit/components-react', () => ({
  useRoomContext: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    localParticipant: {
      setMicrophoneEnabled: jest.fn(),
    },
    on: jest.fn(),
  })),
  useConnectionState: jest.fn(() => ConnectionState.Disconnected),
}));

jest.mock('livekit-client', () => ({
  ConnectionState: {
    Disconnected: 'disconnected',
    Connected: 'connected',
    Connecting: 'connecting',
    Reconnecting: 'reconnecting',
    SignalReconnecting: 'signalReconnecting',
  },
}));

jest.mock('../CallButton/hooks/usePhoneNumbers', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../modal/LeadDetailsModal/PhoneModal/useAddPhone', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseGetUserSelector = jest.fn(() => ({
  name: 'users/test-agent-123',
  firstName: 'Test',
}));

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: () => mockUseGetUserSelector(),
}));

jest.mock('hooks/useBeforeUnload', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockEnsureMicrophonePermission = jest.fn();
const mockInitiateCall = jest.fn();
const mockDialPhoneNumber = jest.fn();
const mockEndCall = jest.fn();
let mockLiveKitCallStatus: LiveKitCallStatus | null = null;
let mockHasCallStarted = false;

jest.mock('./LivekitRoomProvider', () => {
  const mockUseLiveKitCallFn = jest.fn(() => ({
    ensureMicrophonePermission: mockEnsureMicrophonePermission,
    initiateCall: mockInitiateCall,
    dialPhoneNumber: mockDialPhoneNumber,
    endCall: mockEndCall,
    callDuration: 0,
    get liveKitCallStatus() {
      return mockLiveKitCallStatus;
    },
    get hasCallStarted() {
      return mockHasCallStarted;
    },
  }));
  return {
    __esModule: true,
    useLiveKitCall: mockUseLiveKitCallFn,
    LiveKitCallStatus: {
      AgentConnecting: 'agentConnecting',
      AgentConnected: 'agentConnected',
      DialingLead: 'dialingLead',
      Ringing: 'ringing',
      Active: 'active',
      Ended: 'ended',
    },
  };
});

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

const mockUseGetLeadSelector = jest.fn(() => ({
  name: 'leads/test-lead-123',
}));

jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: () => mockUseGetLeadSelector(),
}));

const mockShowModal = jest.fn();
const mockSetHasShowedSummary = jest.fn();

jest.mock('presentation/redux/actions/ui', () => ({
  showModal: jest.fn((...args: any[]) => {
    mockShowModal(...args);
    return { type: 'SHOW_MODAL', payload: args[0] };
  }),
}));

jest.mock('presentation/redux/actions/leads/detail', () => {
  const actual = jest.requireActual('presentation/redux/actions/leads/detail');
  return {
    ...actual,
    setHasShowedSummary: jest.fn((...args: any[]) => {
      mockSetHasShowedSummary(...args);
      return {
        type: actual.LeadDetailActionTypes.SET_HAS_SHOWED_SUMMARY,
        payload: args[0],
      };
    }),
  };
});

// Mock child components
jest.mock('../CallButton', () => ({
  __esModule: true,
  default: function MockCallButton({
    phoneNumbers,
    primaryPhoneIndex,
    buttonState,
    onStartCall,
    onEndCall,
    onPhoneSelect,
    onPhoneDelete,
  }: {
    phoneNumbers: PhoneNumber[];
    primaryPhoneIndex: number;
    buttonState: string;
    onStartCall?: (phone: string, phoneIndex: number) => void;
    onEndCall?: () => void;
    onPhoneSelect?: (phone: string, phoneIndex: number) => void;
    onPhoneDelete?: (phone: string, phoneIndex: number) => void;
  }) {
    return (
      <div data-testid="call-button">
        <button
          type="button"
          data-testid="start-call-button"
          onClick={() =>
            onStartCall?.(
              phoneNumbers[primaryPhoneIndex]?.phone,
              primaryPhoneIndex
            )
          }
        >
          Call {phoneNumbers[primaryPhoneIndex]?.phone}
        </button>
        <button type="button" data-testid="end-call-button" onClick={onEndCall}>
          End Call
        </button>
        <button
          type="button"
          data-testid="select-phone-button"
          onClick={() => onPhoneSelect?.(phoneNumbers[0]?.phone, 0)}
        >
          Select Phone
        </button>
        <button
          type="button"
          data-testid="delete-phone-button"
          onClick={() => onPhoneDelete?.(phoneNumbers[0]?.phone, 0)}
        >
          Delete Phone
        </button>
        <div data-testid="button-state">{buttonState}</div>
      </div>
    );
  },
}));

jest.mock('../modal/CommonModal', () => ({
  __esModule: true,
  default: function MockCommonModal({
    open,
    handleCloseModal,
    children,
    dataTestId,
  }: {
    open: boolean;
    handleCloseModal: () => void;
    children: React.ReactNode;
    dataTestId?: string;
  }) {
    if (!open) return null;
    return (
      <div data-testid={dataTestId || 'common-modal'}>
        {children}
        <button type="button" onClick={handleCloseModal}>
          Close
        </button>
      </div>
    );
  },
}));

describe('CallButtonLiveKit', () => {
  const mockPhoneNumbers: PhoneNumber[] = [
    { phone: '0999999999', status: 'verified' },
    { phone: '0888888888', status: 'unverified' },
  ];

  const mockUsePhoneNumbers = usePhoneNumbers as jest.MockedFunction<
    typeof usePhoneNumbers
  >;
  const mockUseAddPhone = useAddPhone as jest.MockedFunction<
    typeof useAddPhone
  >;
  const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
  >;
  const mockUseSnackbar = useSnackbar as jest.MockedFunction<
    typeof useSnackbar
  >;

  const mockSetPrimaryPhoneIndex = jest.fn();
  const mockSetPrimaryPhoneForCustomer = jest.fn();
  const mockRemovePhoneFromLead = jest.fn();
  const mockShowSuccessSnackbar = jest.fn();

  beforeEach(() => {
    // Set up mocks FIRST - these MUST return values because the component accesses
    // lead.name and currentUser.name in useCallback dependency array during render
    mockUseGetUserSelector.mockReturnValue({
      name: 'users/test-agent-123',
      firstName: 'Test',
    });

    mockUseGetLeadSelector.mockReturnValue({
      name: 'leads/test-lead-123',
    } as any);

    // Reset dynamic mocks
    mockLiveKitCallStatus = null;
    mockHasCallStarted = false;
    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Disconnected);
    // The mock is already set up in jest.mock, we just need to ensure it returns the right values
    // The mock implementation is handled by the jest.mock factory function

    // Clear only call history, not implementations
    mockEnsureMicrophonePermission.mockClear();
    mockInitiateCall.mockClear();
    mockDialPhoneNumber.mockClear();
    mockEndCall.mockClear();
    mockSetPrimaryPhoneIndex.mockClear();
    mockSetPrimaryPhoneForCustomer.mockClear();
    mockRemovePhoneFromLead.mockClear();

    // Mock useAppSelector to accept a selector function and return the result
    mockUseAppSelector.mockImplementation((selector: any) => {
      const mockState = {
        authReducer: {
          data: {
            user: {
              name: 'users/test-agent-123',
              firstName: 'Test',
            },
          },
        },
        order: {
          payload: {
            customer: {
              name: 'Test Customer',
            },
            lead: 'test-lead-id',
          },
        },
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/test-lead-123',
            },
          },
          callReducer: {
            data: {
              hasShowedSummary: false,
            },
          },
        },
      };
      return selector(mockState);
    });

    // Clear action mocks
    mockShowModal.mockClear();
    mockSetHasShowedSummary.mockClear();

    const mockShowErrorSnackbar = jest.fn();
    mockUseSnackbar.mockReturnValue({
      showSuccessSnackbar: mockShowSuccessSnackbar,
      showErrorSnackbar: mockShowErrorSnackbar,
    } as any);

    // Mock useLiveKitCall default return values
    mockEnsureMicrophonePermission.mockResolvedValue(true);
    mockInitiateCall.mockResolvedValue('calls/test-call-123');
    mockDialPhoneNumber.mockResolvedValue('participants/lead-123');
    mockEndCall.mockResolvedValue(undefined);

    mockUseAddPhone.mockReturnValue({
      setPrimaryPhoneIndex: mockSetPrimaryPhoneIndex,
      setPrimaryPhoneForCustomer: mockSetPrimaryPhoneForCustomer,
      removePhoneFromLead: mockRemovePhoneFromLead,
      status: {
        isLoading: false,
      },
    } as any);
  });

  it('renders CallButton when no phone numbers', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: [],
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('call-button')).toBeInTheDocument();
  });

  it('renders CallButton when primary phone index is invalid', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 10, // Invalid index
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('call-button')).toBeInTheDocument();
  });

  it('renders CallButton when phone numbers are available', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('call-button')).toBeInTheDocument();
    expect(screen.getByText('Call 0999999999')).toBeInTheDocument();
  });

  it('handles phone selection', async () => {
    const user = userEvent.setup();
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    const selectButton = screen.getByTestId('select-phone-button');
    await user.click(selectButton);

    expect(mockSetPrimaryPhoneForCustomer).toHaveBeenCalledWith(
      encodeURIComponent('0999999999'),
      'customer/123'
    );
    expect(mockSetPrimaryPhoneIndex).toHaveBeenCalledWith(0);
  });

  it('opens delete modal when delete is clicked', async () => {
    const user = userEvent.setup();
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    const deleteButton = screen.getByTestId('delete-phone-button');
    await user.click(deleteButton);

    const modal = screen.getByTestId('deletePhoneModal');
    expect(modal).toBeInTheDocument();
    // Query within the modal to avoid multiple matches
    expect(modal.querySelector('.text-red-500')).toHaveTextContent(
      '0999999999'
    );
  });

  it('closes delete modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    // Open modal
    const deleteButton = screen.getByTestId('delete-phone-button');
    await user.click(deleteButton);
    expect(screen.getByTestId('deletePhoneModal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(screen.queryByTestId('deletePhoneModal')).not.toBeInTheDocument();
  });

  it('calls removePhoneFromLead when confirm delete is clicked', async () => {
    const user = userEvent.setup();
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    // Open modal
    const deleteButton = screen.getByTestId('delete-phone-button');
    await user.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('confirmDeleteButton');
    await user.click(confirmButton);

    expect(mockRemovePhoneFromLead).toHaveBeenCalledWith(
      '0999999999',
      expect.any(Function)
    );
  });

  it('shows success snackbar after successful phone deletion', async () => {
    const user = userEvent.setup();
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    // Open modal
    const deleteButton = screen.getByTestId('delete-phone-button');
    await user.click(deleteButton);

    // Confirm delete
    const confirmButton = screen.getByTestId('confirmDeleteButton');
    await user.click(confirmButton);

    // Simulate successful deletion callback wrapped in act
    const callback = mockRemovePhoneFromLead.mock.calls[0][1];
    await act(async () => {
      callback();
    });

    expect(mockShowSuccessSnackbar).toHaveBeenCalled();

    // Wait for the modal to close after state updates
    await waitFor(() => {
      expect(screen.queryByTestId('deletePhoneModal')).not.toBeInTheDocument();
    });
  });

  it('handles start call', async () => {
    const user = userEvent.setup();

    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    render(<CallButtonLiveKit customerId="customer/123" />);

    const startCallButton = screen.getByTestId('start-call-button');
    await act(async () => {
      await user.click(startCallButton);
    });

    await waitFor(() => {
      expect(mockEnsureMicrophonePermission).toHaveBeenCalled();
      expect(mockInitiateCall).toHaveBeenCalledWith('users/test-agent-123');
      expect(mockDialPhoneNumber).toHaveBeenCalledWith(
        'calls/test-call-123',
        'leads/test-lead-123',
        0
      );
    });
  });

  it('shows error snackbar when microphone permission is denied', async () => {
    const user = userEvent.setup();
    const mockShowErrorSnackbar = jest.fn();

    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    mockUseSnackbar.mockReturnValue({
      showSuccessSnackbar: jest.fn(),
      showErrorSnackbar: mockShowErrorSnackbar,
    } as any);

    mockEnsureMicrophonePermission.mockResolvedValue(false);

    render(<CallButtonLiveKit customerId="customer/123" />);

    const startCallButton = screen.getByTestId('start-call-button');
    await act(async () => {
      await user.click(startCallButton);
    });

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalled();
      expect(mockInitiateCall).not.toHaveBeenCalled();
    });
  });

  it('handles end call', async () => {
    const user = userEvent.setup();

    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    mockLiveKitCallStatus = LiveKitCallStatus.Active;

    render(<CallButtonLiveKit customerId="customer/123" />);

    const endCallButton = screen.getByTestId('end-call-button');
    await act(async () => {
      await user.click(endCallButton);
    });

    await waitFor(() => {
      expect(mockEndCall).toHaveBeenCalled();
    });
  });

  it('shows error snackbar when initiateCall fails', async () => {
    const user = userEvent.setup();
    const mockShowErrorSnackbar = jest.fn();

    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    mockUseSnackbar.mockReturnValue({
      showSuccessSnackbar: jest.fn(),
      showErrorSnackbar: mockShowErrorSnackbar,
    } as any);

    mockInitiateCall.mockRejectedValue(new Error('Failed to initiate call'));

    render(<CallButtonLiveKit customerId="customer/123" />);

    const startCallButton = screen.getByTestId('start-call-button');
    await act(async () => {
      await user.click(startCallButton);
    });

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'text.callStartFailed'
      );
      expect(screen.getByTestId('button-state')).toHaveTextContent(
        'readyToCall'
      );
    });
  });

  it('shows error snackbar when dialPhoneNumber fails', async () => {
    const user = userEvent.setup();
    const mockShowErrorSnackbar = jest.fn();

    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    mockUseSnackbar.mockReturnValue({
      showSuccessSnackbar: jest.fn(),
      showErrorSnackbar: mockShowErrorSnackbar,
    } as any);

    mockDialPhoneNumber.mockRejectedValue(new Error('Failed to dial'));

    render(<CallButtonLiveKit customerId="customer/123" />);

    const startCallButton = screen.getByTestId('start-call-button');
    await act(async () => {
      await user.click(startCallButton);
    });

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'text.callStartFailed'
      );
      expect(screen.getByTestId('button-state')).toHaveTextContent(
        'readyToCall'
      );
    });
  });

  it('sets button state to Reconnecting when connection state is Reconnecting', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Reconnecting);

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent(
      'reconnecting'
    );
  });

  it('sets button state to Connecting when liveKitCallStatus is AgentConnecting', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.AgentConnecting;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('connecting');
  });

  it('sets button state to Connected when liveKitCallStatus is AgentConnected', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.AgentConnected;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('connected');
  });

  it('sets button state to Ringing when liveKitCallStatus is DialingLead', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.DialingLead;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('ringing');
  });

  it('sets button state to Ringing when liveKitCallStatus is Ringing', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.Ringing;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('ringing');
  });

  it('sets button state to InCall when liveKitCallStatus is Active', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.Active;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('inCall');
  });

  it('sets button state to ReadyToCall when liveKitCallStatus is Ended', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = LiveKitCallStatus.Ended;

    render(<CallButtonLiveKit customerId="customer/123" />);

    expect(screen.getByTestId('button-state')).toHaveTextContent('readyToCall');
  });

  it('handles default case in switch statement when liveKitCallStatus is null', () => {
    mockUsePhoneNumbers.mockReturnValue({
      phoneNumbers: mockPhoneNumbers,
      primaryPhoneIndex: 0,
    });

    (
      useConnectionState as jest.MockedFunction<typeof useConnectionState>
    ).mockReturnValue(ConnectionState.Connected);
    mockLiveKitCallStatus = null;
    // The mock is already set up in jest.mock, it will automatically use the current mockLiveKitCallStatus value

    render(<CallButtonLiveKit customerId="customer/123" />);

    // Should remain in initial state
    expect(screen.getByTestId('button-state')).toHaveTextContent('readyToCall');
  });

  describe('hasShowedSummary functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('sets hasShowedSummary to false when call button is clicked and hasShowedSummary is true', async () => {
      const user = userEvent.setup({ delay: null });

      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      // Set hasShowedSummary to true in the mock state
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: true,
              },
            },
          },
        };
        return selector(mockState);
      });

      render(<CallButtonLiveKit customerId="customer/123" />);

      const startCallButton = screen.getByTestId('start-call-button');
      await act(async () => {
        await user.click(startCallButton);
      });

      // Advance timers to trigger setTimeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSetHasShowedSummary).toHaveBeenCalledWith(false);
      });
    });

    it('does not set hasShowedSummary when call button is clicked and hasShowedSummary is already false', async () => {
      const user = userEvent.setup({ delay: null });

      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      // Set hasShowedSummary to false in the mock state
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: false,
              },
            },
          },
        };
        return selector(mockState);
      });

      render(<CallButtonLiveKit customerId="customer/123" />);

      const startCallButton = screen.getByTestId('start-call-button');
      await act(async () => {
        await user.click(startCallButton);
      });

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not call setHasShowedSummary since it's already false
      expect(mockSetHasShowedSummary).not.toHaveBeenCalled();
    });

    it('sets hasShowedSummary to true when hang up button is clicked', async () => {
      const user = userEvent.setup({ delay: null });

      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      mockLiveKitCallStatus = LiveKitCallStatus.Active;

      render(<CallButtonLiveKit customerId="customer/123" />);

      const endCallButton = screen.getByTestId('end-call-button');
      await act(async () => {
        await user.click(endCallButton);
      });

      // Advance timers to trigger setTimeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSetHasShowedSummary).toHaveBeenCalledWith(true);
        expect(mockEndCall).toHaveBeenCalled();
      });
    });

    it('shows modal when call ends and hasShowedSummary is false', () => {
      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      // Set hasShowedSummary to false in the mock state
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: false,
              },
            },
          },
        };
        return selector(mockState);
      });

      (
        useConnectionState as jest.MockedFunction<typeof useConnectionState>
      ).mockReturnValue(ConnectionState.Connected);
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;
      mockHasCallStarted = true;

      render(<CallButtonLiveKit customerId="customer/123" />);

      expect(mockShowModal).toHaveBeenCalledWith(
        expect.any(String) // CONSTANTS.ModalConfig.leadSummaryCallModal
      );
    });

    it('does not show modal when call ends and hasShowedSummary is true', () => {
      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      // Set hasShowedSummary to true in the mock state
      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: true,
              },
            },
          },
        };
        return selector(mockState);
      });

      (
        useConnectionState as jest.MockedFunction<typeof useConnectionState>
      ).mockReturnValue(ConnectionState.Connected);
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;

      render(<CallButtonLiveKit customerId="customer/123" />);

      expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('calls onCallEnd callback when provided and call ends with hasShowedSummary false', () => {
      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: false,
              },
            },
          },
        };
        return selector(mockState);
      });

      (
        useConnectionState as jest.MockedFunction<typeof useConnectionState>
      ).mockReturnValue(ConnectionState.Connected);
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;
      mockHasCallStarted = true;

      const mockOnCallEnd = jest.fn();

      render(
        <CallButtonLiveKit
          customerId="customer/123"
          onCallEnd={mockOnCallEnd}
        />
      );

      expect(mockOnCallEnd).toHaveBeenCalled();
      expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('falls back to showModal when onCallEnd is not provided', () => {
      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: false,
              },
            },
          },
        };
        return selector(mockState);
      });

      (
        useConnectionState as jest.MockedFunction<typeof useConnectionState>
      ).mockReturnValue(ConnectionState.Connected);
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;
      mockHasCallStarted = true;

      render(<CallButtonLiveKit customerId="customer/123" />);

      expect(mockShowModal).toHaveBeenCalledWith(
        expect.any(String) // CONSTANTS.ModalConfig.leadSummaryCallModal
      );
    });

    it('does not show modal when call ends but hasCallStarted is false (API failed early)', () => {
      mockUsePhoneNumbers.mockReturnValue({
        phoneNumbers: mockPhoneNumbers,
        primaryPhoneIndex: 0,
      });

      mockUseAppSelector.mockImplementation((selector: any) => {
        const mockState = {
          leadsDetailReducer: {
            callReducer: {
              data: {
                hasShowedSummary: false,
              },
            },
          },
        };
        return selector(mockState);
      });

      (
        useConnectionState as jest.MockedFunction<typeof useConnectionState>
      ).mockReturnValue(ConnectionState.Connected);
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;
      mockHasCallStarted = false;

      render(<CallButtonLiveKit customerId="customer/123" />);

      expect(mockShowModal).not.toHaveBeenCalled();
    });
  });
});
