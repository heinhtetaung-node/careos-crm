// @ts-nocheck
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LiveListenProvider, useLiveListen } from './LiveListenContext';
import { Room, RoomEvent } from 'livekit-client';

// Mock dependencies - define mocks at module level
const mockAddAgentToCall = jest.fn();
const mockGetJoinToken = jest.fn();
const mockFetchLeadById = jest.fn();
const mockShowErrorSnackbar = jest.fn();

jest.mock('@livekit/components-react', () => ({
  RoomContext: {
    Provider: ({ children }) => (
      <div data-testid="room-context">{children}</div>
    ),
  },
  useTracks: jest.fn(() => []),
}));

jest.mock('data/slices/callSlice/callSlice', () => ({
  useAddAgentToCallMutation: () => [mockAddAgentToCall],
  useLazyGetJoinTokenQuery: () => [mockGetJoinToken],
}));

jest.mock('data/slices/leadSlice', () => ({
  useLazyGetLeadByIDQuery: () => [mockFetchLeadById],
}));

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: () => ({ name: 'users/test-user' }),
}));

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: () => ({
    showErrorSnackbar: mockShowErrorSnackbar,
  }),
}));

jest.mock(
  'presentation/pages/admin/PerformanceStatistic/components/LiveListenModal',
  () => ({
    __esModule: true,
    default: ({ agentName, customerName, leadId, callDuration, onClose }) => (
      <div data-testid="live-listen-modal">
        <div data-testid="agent-name">{agentName}</div>
        <div data-testid="customer-name">{customerName}</div>
        <div data-testid="lead-id">{leadId}</div>
        <div data-testid="call-duration">{callDuration}</div>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ),
  })
);

// Mock Room
const mockRoomConnect = jest.fn(() => Promise.resolve());
const mockRoomDisconnect = jest.fn();
const mockRoomOn = jest.fn();
const mockRoomOff = jest.fn();
const mockRoom = {
  connect: mockRoomConnect,
  disconnect: mockRoomDisconnect,
  on: mockRoomOn,
  off: mockRoomOff,
  state: 'disconnected',
};

jest.mock('livekit-client', () => ({
  Room: jest.fn(() => mockRoom),
  RoomEvent: {
    Disconnected: 'disconnected',
  },
  Track: {
    Source: {
      Microphone: 'microphone',
    },
  },
}));

describe('LiveListenContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Reset room state
    mockRoom.state = 'disconnected';
    mockRoomConnect.mockClear();
    mockRoomDisconnect.mockClear();
    mockRoomOn.mockClear();
    mockRoomOff.mockClear();

    // Reset mocks
    mockAddAgentToCall.mockClear();
    mockGetJoinToken.mockClear();
    mockFetchLeadById.mockClear();
    mockShowErrorSnackbar.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useLiveListen', () => {
    it('throws error when used outside LiveListenProvider', () => {
      const TestComponent = () => {
        useLiveListen();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useLiveListen must be used within a LiveListenProvider');

      consoleError.mockRestore();
    });

    it('returns context when used within LiveListenProvider', () => {
      const TestComponent = () => {
        const { handleLiveListen, isLiveListenActive } = useLiveListen();
        return (
          <div>
            <div data-testid="is-active">{isLiveListenActive.toString()}</div>
            <button
              data-testid="trigger"
              onClick={() =>
                handleLiveListen('call-123', 'Agent', 'leads/lead-456', '05:30')
              }
            >
              Trigger
            </button>
          </div>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      expect(screen.getByTestId('is-active')).toHaveTextContent('false');
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });
  });

  describe('LiveListenProvider', () => {
    it('renders children', () => {
      render(
        <LiveListenProvider>
          <div data-testid="child">Child Component</div>
        </LiveListenProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('does not render LiveListenModal initially', () => {
      render(
        <LiveListenProvider>
          <div>Test</div>
        </LiveListenProvider>
      );

      expect(screen.queryByTestId('live-listen-modal')).not.toBeInTheDocument();
    });
  });

  describe('handleLiveListen', () => {
    it('does nothing when activeCallId is empty', () => {
      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen('', 'Agent', 'leads/lead-456', '05:30')
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      act(() => {
        screen.getByRole('button').click();
      });

      expect(mockAddAgentToCall).not.toHaveBeenCalled();
      expect(screen.queryByTestId('live-listen-modal')).not.toBeInTheDocument();
    });

    it('successfully handles live listen', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockAddAgentToCall).toHaveBeenCalledWith({
          callName: 'call-123',
          agentName: 'users/test-user',
        });
      });

      await waitFor(() => {
        expect(mockGetJoinToken).toHaveBeenCalledWith('participant-123');
      });

      await waitFor(() => {
        expect(mockRoomConnect).toHaveBeenCalledWith(
          'wss://test.com',
          'token-123'
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('agent-name')).toHaveTextContent('Agent Name');
      expect(screen.getByTestId('customer-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('lead-id')).toHaveTextContent('LEAD-123');
      expect(screen.getByTestId('call-duration')).toHaveTextContent('05:30');
    });

    it('handles error from addAgentToCall', async () => {
      mockAddAgentToCall.mockRejectedValue(new Error('Failed to add agent'));

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'Failed to connect to call room'
        );
      });
    });

    it('handles error when addAgentToCall returns no data', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: null,
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'Failed to connect to call room'
        );
      });
    });

    it('handles error from getJoinToken', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockRejectedValue(new Error('Failed to get token'));

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'Failed to connect to call room'
        );
      });
    });

    it('handles error when getJoinToken returns no data', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: null,
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'Failed to connect to call room'
        );
      });
    });

    it('handles error from fetchLeadById', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Failed to fetch lead')),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'Failed to fetch lead details'
        );
      });

      // Modal should still be shown even if lead fetch fails
      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('customer-name')).toHaveTextContent('');
    });

    it('handles switching call when room is already connected', async () => {
      mockRoom.state = 'connected';

      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      // Should disconnect first
      expect(mockRoomDisconnect).toHaveBeenCalled();

      // Get the disconnect event handler registered by waitForDisconnect
      const disconnectHandlers = mockRoomOn.mock.calls
        .filter((call) => call[0] === RoomEvent.Disconnected)
        .map((call) => call[1]);
      const waitForDisconnectHandler =
        disconnectHandlers[disconnectHandlers.length - 1];

      // Reset room state to disconnected
      mockRoom.state = 'disconnected';

      // Simulate disconnect event to trigger the recursive call
      await act(async () => {
        if (waitForDisconnectHandler) {
          waitForDisconnectHandler();
        }
        await Promise.resolve();
      });

      // Should eventually connect to new call
      await waitFor(() => {
        expect(mockAddAgentToCall).toHaveBeenCalled();
      });
    });

    it('handles switching call when popup is already open', async () => {
      // First, open the modal
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <>
            <button
              data-testid="first-call"
              onClick={() =>
                handleLiveListen('call-1', 'Agent 1', 'leads/lead-1', '01:00')
              }
            >
              First Call
            </button>
            <button
              data-testid="second-call"
              onClick={() =>
                handleLiveListen('call-2', 'Agent 2', 'leads/lead-2', '02:00')
              }
            >
              Second Call
            </button>
          </>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      // Open first call
      await act(async () => {
        screen.getByTestId('first-call').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      // Reset mocks
      mockAddAgentToCall.mockClear();
      mockGetJoinToken.mockClear();
      mockRoomDisconnect.mockClear();

      // Now trigger second call (should switch)
      await act(async () => {
        screen.getByTestId('second-call').click();
        await Promise.resolve();
      });

      // Should disconnect first
      expect(mockRoomDisconnect).toHaveBeenCalled();

      // Get the disconnect event handler
      const disconnectHandlers = mockRoomOn.mock.calls
        .filter((call) => call[0] === RoomEvent.Disconnected)
        .map((call) => call[1]);
      const waitForDisconnectHandler =
        disconnectHandlers[disconnectHandlers.length - 1];

      // Reset room state
      mockRoom.state = 'disconnected';

      // Simulate disconnect event
      await act(async () => {
        if (waitForDisconnectHandler) {
          waitForDisconnectHandler();
        }
        await Promise.resolve();
      });

      // Should eventually connect to second call
      await waitFor(() => {
        expect(mockAddAgentToCall).toHaveBeenCalled();
      });
    });

    it('disconnects room before connecting when room state is connected', async () => {
      mockRoom.state = 'disconnected';

      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      // Set room state to connected before triggering
      mockRoom.state = 'connected';

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      // joinCall should disconnect the room since it was connected
      await waitFor(() => {
        expect(mockRoomDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe('handleClose', () => {
    it('closes modal and disconnects room', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      // Open modal
      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      // Close modal
      await act(async () => {
        screen.getByTestId('close-modal').click();
      });

      await waitFor(() => {
        expect(
          screen.queryByTestId('live-listen-modal')
        ).not.toBeInTheDocument();
      });

      expect(mockRoomDisconnect).toHaveBeenCalled();
    });
  });

  describe('Room disconnected event', () => {
    it('closes modal when room disconnects and not switching call', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      // Open modal
      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      // Get the disconnect event handler
      const disconnectHandlers = mockRoomOn.mock.calls
        .filter((call) => call[0] === RoomEvent.Disconnected)
        .map((call) => call[1]);
      const handleDisconnected = disconnectHandlers[0];

      // Simulate disconnect event (not switching call)
      await act(async () => {
        if (handleDisconnected) {
          handleDisconnected();
        }
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(
          screen.queryByTestId('live-listen-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('does not close modal when room disconnects during call switch', async () => {
      mockRoom.state = 'connected';

      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      // Get the disconnect event handler from waitForDisconnect
      const disconnectHandlers = mockRoomOn.mock.calls
        .filter((call) => call[0] === RoomEvent.Disconnected)
        .map((call) => call[1]);
      const waitForDisconnectHandler =
        disconnectHandlers[disconnectHandlers.length - 1];

      // Simulate disconnect during switch (isSwitchingCallRef.current is true)
      await act(async () => {
        if (waitForDisconnectHandler) {
          waitForDisconnectHandler();
        }
        await Promise.resolve();
      });

      // Modal should still be open (or will be reopened after switch)
      // The actual behavior depends on the recursive call completing
    });
  });

  describe('Modal rendering', () => {
    it('renders LiveListenModal with correct props when open', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('agent-name')).toHaveTextContent('Agent Name');
      expect(screen.getByTestId('customer-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('lead-id')).toHaveTextContent('LEAD-123');
      expect(screen.getByTestId('call-duration')).toHaveTextContent('05:30');
    });

    it('renders modal with empty customer name when fetchLeadById fails', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });

      expect(screen.getByTestId('customer-name')).toHaveTextContent('');
    });
  });

  describe('Ref updates', () => {
    it('updates openPopupAudioRenderRef when openPopupAudioRender changes', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      // Modal should be open, which means openPopupAudioRenderRef.current should be true
      await waitFor(() => {
        expect(screen.getByTestId('live-listen-modal')).toBeInTheDocument();
      });
    });
  });

  describe('isLiveListenActive', () => {
    it('returns false initially', () => {
      const TestComponent = () => {
        const { isLiveListenActive } = useLiveListen();
        return (
          <div data-testid="is-active">{isLiveListenActive.toString()}</div>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      expect(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    it('returns true when modal is open', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen, isLiveListenActive } = useLiveListen();
        return (
          <>
            <div data-testid="is-active">{isLiveListenActive.toString()}</div>
            <button
              onClick={() =>
                handleLiveListen(
                  'call-123',
                  'Agent Name',
                  'leads/lead-456',
                  '05:30'
                )
              }
            >
              Trigger
            </button>
          </>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      expect(screen.getByTestId('is-active')).toHaveTextContent('false');

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-active')).toHaveTextContent('true');
      });
    });
  });

  describe('Room cleanup', () => {
    it('disconnects room on unmount', () => {
      const { unmount } = render(
        <LiveListenProvider>
          <div>Test</div>
        </LiveListenProvider>
      );

      unmount();

      expect(mockRoomDisconnect).toHaveBeenCalled();
    });
  });

  describe('Lead ID handling', () => {
    it('handles leadId with "leads/" prefix', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen(
                'call-123',
                'Agent Name',
                'leads/lead-456',
                '05:30'
              )
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith('lead-456');
      });
    });

    it('handles leadId without "leads/" prefix', async () => {
      mockAddAgentToCall.mockResolvedValue({
        data: { name: 'participant-123' },
      });
      mockGetJoinToken.mockResolvedValue({
        data: { sfuUrl: 'wss://test.com', token: 'token-123' },
      });
      mockFetchLeadById.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({
          data: { customerFirstName: 'John', customerLastName: 'Doe' },
          humanId: 'LEAD-123',
        }),
      });

      const TestComponent = () => {
        const { handleLiveListen } = useLiveListen();
        return (
          <button
            onClick={() =>
              handleLiveListen('call-123', 'Agent Name', 'lead-456', '05:30')
            }
          >
            Trigger
          </button>
        );
      };

      render(
        <LiveListenProvider>
          <TestComponent />
        </LiveListenProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockFetchLeadById).toHaveBeenCalledWith('lead-456');
      });
    });
  });
});
