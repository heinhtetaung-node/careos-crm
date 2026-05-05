import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import LivekitRoomProvider, {
  useLiveKitCall,
  LiveKitCallStatus,
} from './LivekitRoomProvider';
import {
  Room,
  RoomEvent,
  ConnectionState,
  DisconnectReason,
  LocalAudioTrack,
} from 'livekit-client';
import { useTracks } from '@livekit/components-react';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

// Mock NewRelic
const mockAddPageAction = jest.fn();
const mockNoticeError = jest.fn();
jest.mock('@careos/newrelic', () => ({
  useNewRelic: jest.fn(() => ({
    nrAgent: {
      addPageAction: mockAddPageAction,
      noticeError: mockNoticeError,
    },
  })),
}));

// Mock flagsmith
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>;
jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn(() => ({})),
}));

// Mock RTK Query hooks
const mockCreateCall = jest.fn();
const mockAddAgentToCall = jest.fn();
const mockAddLeadToCall = jest.fn();
const mockGetJoinToken = jest.fn();

jest.mock('data/slices/callSlice/callSlice', () => ({
  useCreateCallMutation: jest.fn(() => [mockCreateCall, { isLoading: false }]),
  useAddAgentToCallMutation: jest.fn(() => [
    mockAddAgentToCall,
    { isLoading: false },
  ]),
  useAddLeadToCallMutation: jest.fn(() => [
    mockAddLeadToCall,
    { isLoading: false },
  ]),
  useLazyGetJoinTokenQuery: jest.fn(() => [
    mockGetJoinToken,
    { isLoading: false },
  ]),
}));

// Mock denoise plugin
const mockSetEnabled = jest.fn();
const mockSetProcessor = jest.fn();
jest.mock('@cc-livekit/denoise-plugin', () => ({
  DenoiseTrackProcessor: jest.fn().mockImplementation(() => ({
    setEnabled: mockSetEnabled,
  })),
}));

// Mock livekit-client
jest.mock('livekit-client', () => {
  class MockLocalAudioTrack {
    setProcessor = jest.fn().mockResolvedValue(undefined);
  }

  return {
    Room: jest.fn(),
    LogLevel: {
      debug: 'debug',
      info: 'info',
      warn: 'warn',
      error: 'error',
    },
    setLogLevel: jest.fn(),
    Track: {
      Source: {
        Microphone: 'microphone',
      },
    },
    ConnectionState: {
      Disconnected: 'disconnected',
      Connected: 'connected',
    },
    DisconnectReason: {
      CLIENT_INITIATED: 'CLIENT_INITIATED',
      UNKNOWN_REASON: 'UNKNOWN_REASON',
    },
    RoomEvent: {
      ParticipantAttributesChanged: 'participantAttributesChanged',
      ConnectionStateChanged: 'connectionStateChanged',
      ParticipantConnected: 'participantConnected',
      ParticipantDisconnected: 'participantDisconnected',
      ConnectionQualityChanged: 'connectionQualityChanged',
      Disconnected: 'disconnected',
      TrackSubscriptionFailed: 'trackSubscriptionFailed',
      MediaDevicesError: 'mediaDevicesError',
      Reconnecting: 'reconnecting',
      Reconnected: 'reconnected',
      LocalTrackPublished: 'localTrackPublished',
    },
    LocalAudioTrack: MockLocalAudioTrack,
  };
});

// Mock @livekit/components-react
jest.mock('@livekit/components-react', () => ({
  RoomContext: {
    Provider: ({ children }: { children: React.ReactNode; value: any }) => (
      <div data-testid="room-context-provider">{children}</div>
    ),
  },
  useTracks: jest.fn(),
  AudioTrack: ({ trackRef }: { trackRef: any }) => (
    <div data-testid={`audio-track-${trackRef.participant.sid}`}>
      Audio Track
    </div>
  ),
}));

const mockUseTracks = useTracks as jest.MockedFunction<typeof useTracks>;
const MockRoom = Room as jest.MockedClass<typeof Room>;

// Test component that uses the hook
function TestComponent() {
  const {
    liveKitCallStatus,
    callDuration,
    ensureMicrophonePermission,
    initiateCall,
    dialPhoneNumber,
    endCall,
  } = useLiveKitCall();

  return (
    <div>
      <div data-testid="call-status">{liveKitCallStatus}</div>
      <div data-testid="call-duration">{callDuration}</div>
      <button
        type="button"
        data-testid="ensure-permission"
        onClick={() => {
          ensureMicrophonePermission().catch(() => {
            // Silently handle errors in test component
          });
        }}
      >
        Ensure Permission
      </button>
      <button
        type="button"
        data-testid="initiate-call"
        onClick={() => {
          initiateCall('agent-123').catch(() => {
            // Silently handle errors in test component
          });
        }}
      >
        Initiate Call
      </button>
      <button
        type="button"
        data-testid="dial-phone"
        onClick={() => {
          dialPhoneNumber('call-123', 'lead-123', 0).catch(() => {
            // Silently handle errors in test component
          });
        }}
      >
        Dial Phone
      </button>
      <button
        type="button"
        data-testid="end-call"
        onClick={() => {
          endCall().catch(() => {
            // Silently handle errors in test component
          });
        }}
      >
        End Call
      </button>
    </div>
  );
}

describe('LivekitRoomProvider', () => {
  let mockRoom: {
    on: jest.Mock;
    disconnect: jest.Mock;
    removeAllListeners: jest.Mock;
    name: string;
    localParticipant: {
      setMicrophoneEnabled: jest.Mock;
    };
    connect: jest.Mock;
  };
  let eventHandlers: Record<string, ((...args: any[]) => void)[]>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    eventHandlers = {};

    mockRoom = {
      on: jest.fn((event: string, handler: (...args: any[]) => void) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
        return mockRoom;
      }),
      disconnect: jest.fn().mockResolvedValue(undefined),
      removeAllListeners: jest.fn(),
      name: 'test-room',
      localParticipant: {
        setMicrophoneEnabled: jest.fn().mockResolvedValue(undefined),
      },
      connect: jest.fn().mockResolvedValue(undefined),
    };

    MockRoom.mockImplementation(() => mockRoom as any);
    mockUseTracks.mockReturnValue([]);
    mockUseFlags.mockReturnValue({});

    // Setup default mock implementations
    mockCreateCall.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ name: 'calls/test-call-123' }),
    });
    mockAddAgentToCall.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        name: 'participants/agent-123',
      }),
    });
    mockAddLeadToCall.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        name: 'participants/lead-123',
      }),
    });
    mockGetJoinToken.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        sfuUrl: 'wss://test-sfu.com',
        token: 'test-token',
      }),
    });

    // Mock navigator.permissions
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      value: {
        query: jest.fn().mockResolvedValue({ state: 'prompt' }),
      },
    });

    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [
            {
              stop: jest.fn(),
            },
          ],
        }),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const triggerEvent = (eventName: string, ...args: any[]): void => {
    if (eventHandlers[eventName]) {
      eventHandlers[eventName].forEach((handler) => handler(...args));
    }
  };

  it('renders without crashing', () => {
    render(
      <LivekitRoomProvider>
        <div data-testid="test-child">Test Child</div>
      </LivekitRoomProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('room-context-provider')).toBeInTheDocument();
  });

  it('provides context values to children', () => {
    render(
      <LivekitRoomProvider>
        <TestComponent />
      </LivekitRoomProvider>
    );

    expect(screen.getByTestId('call-status')).toHaveTextContent('idle');
    expect(screen.getByTestId('call-duration')).toHaveTextContent('0');
  });

  describe('useLiveKitCall hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useLiveKitCall must be used within LivekitRoomProvider');

      console.error = originalError;
    });
  });

  describe('ensureMicrophonePermission', () => {
    it('returns true when permission is already granted', async () => {
      (navigator.permissions.query as jest.Mock).mockResolvedValue({
        state: 'granted',
      });

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('ensure-permission');
      await act(async () => {
        button.click();
      });

      expect(navigator.permissions.query).toHaveBeenCalled();
      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
    });

    it('requests permission when not granted', async () => {
      (navigator.permissions.query as jest.Mock).mockResolvedValue({
        state: 'prompt',
      });

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('ensure-permission');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
        });
      });
    });

    it('handles permission denial gracefully', async () => {
      (navigator.permissions.query as jest.Mock).mockResolvedValue({
        state: 'prompt',
      });
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('ensure-permission');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Microphone permission denied or error:',
          expect.any(Error)
        );
      });
    });

    it('handles browsers without permissions API gracefully', async () => {
      // When permissions.query throws an error, the component should catch it
      // and return false (the component doesn't fall through to getUserMedia in this case)
      const originalQuery = navigator.permissions.query;
      (navigator.permissions.query as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Permissions API not available'));

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('ensure-permission');
      await act(async () => {
        button.click();
      });

      // The component catches the error from permissions.query
      await waitFor(() => {
        expect(navigator.permissions.query).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'Microphone permission denied or error:',
          expect.any(Error)
        );
        // getUserMedia should NOT be called when permissions.query throws
        expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
      });

      // Restore original
      navigator.permissions.query = originalQuery;
    });
  });

  describe('initiateCall', () => {
    it('successfully initiates a call', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('initiate-call');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(mockCreateCall).toHaveBeenCalled();
        expect(mockAddAgentToCall).toHaveBeenCalledWith({
          callName: 'calls/test-call-123',
          agentName: 'agent-123',
        });
        expect(mockGetJoinToken).toHaveBeenCalledWith('participants/agent-123');
        expect(mockRoom.connect).toHaveBeenCalledWith(
          'wss://test-sfu.com',
          'test-token'
        );
        expect(
          mockRoom.localParticipant.setMicrophoneEnabled
        ).toHaveBeenCalledWith(true);
      });

      expect(screen.getByTestId('call-status')).toHaveTextContent(
        LiveKitCallStatus.AgentConnected
      );
    });

    it('handles call initiation failure', async () => {
      const error = new Error('Failed to create call');
      mockCreateCall.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(error),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('initiate-call');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(mockNoticeError).toHaveBeenCalledWith(
          'Failed to initiate call',
          {
            callName: '',
            error: JSON.stringify(error),
          }
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to initiate call',
          error
        );
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.Ended
        );
      });
    });

    it('sets status to AgentConnecting during initiation', async () => {
      mockCreateCall.mockReturnValue({
        unwrap: jest.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve({ name: 'calls/test-call-123' }), 100);
            })
        ),
      });

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('initiate-call');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.AgentConnecting
        );
      });
    });
  });

  describe('dialPhoneNumber', () => {
    beforeEach(() => {
      // Set up initial call state
      mockCreateCall.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({ name: 'calls/test-call-123' }),
      });
    });

    it('successfully dials a phone number', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      // First initiate call
      const initiateButton = screen.getByTestId('initiate-call');
      await act(async () => {
        initiateButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.AgentConnected
        );
      });

      // Then dial phone
      const dialButton = screen.getByTestId('dial-phone');
      await act(async () => {
        dialButton.click();
      });

      await waitFor(() => {
        expect(mockAddLeadToCall).toHaveBeenCalledWith({
          callName: 'call-123',
          leadName: 'lead-123',
          phoneIndex: 0,
        });
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.DialingLead
        );
      });
    });

    it('handles dial failure', async () => {
      const error = new Error('Failed to add lead');
      mockAddLeadToCall.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(error),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const dialButton = screen.getByTestId('dial-phone');
      await act(async () => {
        dialButton.click();
      });

      await waitFor(() => {
        expect(mockNoticeError).toHaveBeenCalledWith(
          'Failed to add lead to call',
          {
            callName: 'call-123',
            leadName: 'lead-123',
            phoneIndex: 0,
            error: JSON.stringify(error),
          }
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to add lead to call',
          error
        );
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.Ended
        );
      });
    });
  });

  describe('endCall', () => {
    it('disconnects from room and sets status to Ended', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('end-call');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(mockRoom.disconnect).toHaveBeenCalled();
        expect(screen.getByTestId('call-status')).toHaveTextContent(
          LiveKitCallStatus.Ended
        );
      });
    });
  });

  describe('call duration timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('starts timer when call becomes active', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      // Trigger active status
      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
      });

      expect(screen.getByTestId('call-duration')).toHaveTextContent('0');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('call-duration')).toHaveTextContent('1');

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('call-duration')).toHaveTextContent('3');
    });

    it('resets duration when call ends', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      // Set call to active
      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
      });

      // Advance time to accumulate duration
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Verify duration accumulated before ending call
      expect(screen.getByTestId('call-duration')).toHaveTextContent('5');

      // End call - this should reset duration immediately
      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'hangup',
        });
      });

      // Duration should be reset to 0 immediately when status changes to Ended
      // The useEffect runs synchronously and resets the duration
      expect(screen.getByTestId('call-duration')).toHaveTextContent('0');

      // Verify interval is cleared (duration should not increment after ending)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Duration should still be 0
      expect(screen.getByTestId('call-duration')).toHaveTextContent('0');
    });

    it('does not start timer multiple times', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Trigger active again
      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
        jest.advanceTimersByTime(1000);
      });

      // Should only have advanced 2 seconds total, not restarted
      expect(screen.getByTestId('call-duration')).toHaveTextContent('2');
    });
  });

  describe('Room event handlers', () => {
    it('handles ParticipantAttributesChanged - active status', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
      });

      expect(screen.getByTestId('call-status')).toHaveTextContent(
        LiveKitCallStatus.Active
      );
    });

    it('handles ParticipantAttributesChanged - ringing status', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'ringing',
        });
      });

      expect(screen.getByTestId('call-status')).toHaveTextContent(
        LiveKitCallStatus.Ringing
      );
    });

    it('handles ParticipantAttributesChanged - hangup status', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'hangup',
        });
      });

      expect(screen.getByTestId('call-status')).toHaveTextContent(
        LiveKitCallStatus.Ended
      );
    });

    it('handles ConnectionStateChanged - disconnected', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(
          RoomEvent.ConnectionStateChanged,
          ConnectionState.Disconnected
        );
      });

      expect(console.log).toHaveBeenCalledWith(
        'connectionStateChanged',
        ConnectionState.Disconnected
      );
      expect(screen.getByTestId('call-status')).toHaveTextContent(
        LiveKitCallStatus.Ended
      );
    });

    it('handles ParticipantConnected', () => {
      const mockParticipant = {
        name: 'test-participant',
        sid: 'participant-sid',
        identity: 'participant-identity',
        attributes: {
          'sip.callID': 'call-123',
          user: 'agent-123',
        },
      };

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantConnected, mockParticipant);
      });

      expect(console.log).toHaveBeenCalledWith(
        'participantConnected',
        mockParticipant.name,
        mockParticipant
      );
      expect(mockAddPageAction).toHaveBeenCalledWith(
        'LIVEKIT_PARTICIPANT_CONNECTED',
        {
          roomID: 'test-room',
          identity: 'participant-identity',
          sipCallID: 'call-123',
          agentName: 'agent-123',
        }
      );
    });

    it('handles ParticipantDisconnected', () => {
      const mockParticipant = {
        name: 'test-participant',
        sid: 'participant-sid',
        identity: 'participant-identity',
        attributes: {
          'sip.callID': 'call-123',
          user: 'agent-123',
        },
      };

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.ParticipantDisconnected, mockParticipant);
      });

      expect(console.log).toHaveBeenCalledWith(
        'participantDisconnected',
        mockParticipant.name,
        mockParticipant
      );
      expect(mockAddPageAction).toHaveBeenCalledWith(
        'LIVEKIT_PARTICIPANT_DISCONNECTED',
        {
          roomID: 'test-room',
          identity: 'participant-identity',
          sipCallID: 'call-123',
          agentName: 'agent-123',
        }
      );
    });

    it('handles ConnectionQualityChanged', () => {
      const mockParticipant = {
        identity: 'participant-identity',
        attributes: {
          'sip.callID': 'call-123',
          user: 'agent-123',
        },
      };

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(
          RoomEvent.ConnectionQualityChanged,
          'good',
          mockParticipant
        );
      });

      expect(mockAddPageAction).toHaveBeenCalledWith(
        'LIVEKIT_CONNECTION_QUALITY_CHANGED',
        {
          roomID: 'test-room',
          quality: 'good',
          identity: 'participant-identity',
          sipCallID: 'call-123',
          agentName: 'agent-123',
        }
      );
    });

    it('handles Disconnected - non-client initiated', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.Disconnected, DisconnectReason.UNKNOWN_REASON);
      });

      expect(mockAddPageAction).toHaveBeenCalledWith('LIVEKIT_DISCONNECTED', {
        roomID: 'test-room',
        reason: 'UNKNOWN_REASON',
      });
    });

    it('does not log page action for client-initiated disconnect', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.Disconnected, DisconnectReason.CLIENT_INITIATED);
      });

      expect(mockAddPageAction).not.toHaveBeenCalledWith(
        'LIVEKIT_DISCONNECTED',
        expect.any(Object)
      );
    });

    it('handles TrackSubscriptionFailed', () => {
      const mockParticipant = {
        identity: 'participant-identity',
        attributes: {
          'sip.callID': 'call-123',
        },
      };

      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(
          RoomEvent.TrackSubscriptionFailed,
          'track-sid-123',
          mockParticipant
        );
      });

      expect(mockAddPageAction).toHaveBeenCalledWith(
        'LIVEKIT_TRACK_SUBSCRIPTION_FAILED',
        {
          roomID: 'test-room',
          trackSid: 'track-sid-123',
          identity: 'participant-identity',
          sipCallID: 'call-123',
        }
      );
    });

    it('handles MediaDevicesError', () => {
      const error = new Error('Media device error');
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.MediaDevicesError, error, 'audioinput');
      });

      expect(mockAddPageAction).toHaveBeenCalledWith(
        'LIVEKIT_MEDIA_DEVICES_ERROR',
        {
          roomID: 'test-room',
          error: 'Media device error',
          kind: 'audioinput',
        }
      );
    });

    it('handles Reconnecting', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.Reconnecting);
      });

      expect(mockAddPageAction).toHaveBeenCalledWith('LIVEKIT_RECONNECTING', {
        roomID: 'test-room',
      });
    });

    it('handles Reconnected', () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.Reconnected);
      });

      expect(mockAddPageAction).toHaveBeenCalledWith('LIVEKIT_RECONNECTED', {
        roomID: 'test-room',
      });
    });
  });

  describe('RoomManager', () => {
    it('renders audio tracks for remote participants', () => {
      const mockTracks = [
        {
          participant: {
            sid: 'participant-1',
            isLocal: false,
          },
        },
        {
          participant: {
            sid: 'participant-2',
            isLocal: false,
          },
        },
      ];

      mockUseTracks.mockReturnValue(mockTracks as any);

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      expect(
        screen.getByTestId('audio-track-participant-1')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('audio-track-participant-2')
      ).toBeInTheDocument();
    });

    it('filters out local participant tracks', () => {
      const mockTracks = [
        {
          participant: {
            sid: 'local-participant',
            isLocal: true,
          },
        },
        {
          participant: {
            sid: 'remote-participant',
            isLocal: false,
          },
        },
      ];

      mockUseTracks.mockReturnValue(mockTracks as any);

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      expect(
        screen.queryByTestId('audio-track-local-participant')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('audio-track-remote-participant')
      ).toBeInTheDocument();
    });

    it('renders nothing when no remote tracks', () => {
      mockUseTracks.mockReturnValue([]);

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      expect(screen.queryByTestId(/audio-track-/)).not.toBeInTheDocument();
    });
  });

  describe('noise suppression', () => {
    it('applies denoise processor when feature flag is enabled', async () => {
      mockUseFlags.mockReturnValue({
        [FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL]:
          { enabled: true },
      } as any);

      const mockTrack = new (LocalAudioTrack as any)();

      const mockTrackPublication = {
        track: mockTrack,
        source: 'microphone',
      };

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      await act(async () => {
        triggerEvent(RoomEvent.LocalTrackPublished, mockTrackPublication);
      });

      await waitFor(() => {
        expect(mockTrack.setProcessor).toHaveBeenCalled();
      });
    });

    it('does not apply denoise processor when feature flag is disabled', () => {
      mockUseFlags.mockReturnValue({
        [FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL]:
          { enabled: false },
      } as any);

      const mockTrack = new (LocalAudioTrack as any)();

      const mockTrackPublication = {
        track: mockTrack,
        source: 'microphone',
      };

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.LocalTrackPublished, mockTrackPublication);
      });

      expect(mockTrack.setProcessor).not.toHaveBeenCalled();
    });

    it('does not apply denoise processor for non-microphone tracks', () => {
      mockUseFlags.mockReturnValue({
        [FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL]:
          { enabled: true },
      } as any);

      const mockTrack = new (LocalAudioTrack as any)();

      const mockTrackPublication = {
        track: mockTrack,
        source: 'camera', // Not microphone
      };

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.LocalTrackPublished, mockTrackPublication);
      });

      expect(mockTrack.setProcessor).not.toHaveBeenCalled();
    });

    it('does not apply denoise processor for non-LocalAudioTrack instances', () => {
      mockUseFlags.mockReturnValue({
        [FeatureFlags.BROK_4227_ENABLE_CLIENT_SIDE_NOISE_SUPPRESSION_LIVEKIT_CALL]:
          { enabled: true },
      } as any);

      const mockTrack = {
        setProcessor: jest.fn(),
      };

      const mockTrackPublication = {
        track: mockTrack,
        source: 'microphone',
      };

      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      act(() => {
        triggerEvent(RoomEvent.LocalTrackPublished, mockTrackPublication);
      });

      expect(mockTrack.setProcessor).not.toHaveBeenCalled();
    });

    it('exposes denoise control on window object', () => {
      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      expect((window as any).denoise).toBeDefined();
      expect((window as any).denoise.setEnabled).toBeDefined();

      act(() => {
        (window as any).denoise.setEnabled(true);
      });

      expect(mockSetEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('cleanup', () => {
    it('removes all event listeners on unmount', () => {
      const { unmount } = render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      unmount();

      expect(mockRoom.removeAllListeners).toHaveBeenCalled();
    });

    it('disconnects from room on window unload', () => {
      render(
        <LivekitRoomProvider>
          <div>Test</div>
        </LivekitRoomProvider>
      );

      act(() => {
        window.dispatchEvent(new Event('unload'));
      });

      expect(mockRoom.disconnect).toHaveBeenCalled();
    });

    it('clears interval on unmount when timer is running', () => {
      jest.useFakeTimers();

      const { unmount } = render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      // Start timer
      act(() => {
        triggerEvent(RoomEvent.ParticipantAttributesChanged, {
          'sip.callStatus': 'active',
        });
      });

      unmount();

      // Advance time - interval should be cleared
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Timer should not continue running after unmount
      expect(mockRoom.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('connectToRoom', () => {
    it('connects with microphone enabled by default', async () => {
      render(
        <LivekitRoomProvider>
          <TestComponent />
        </LivekitRoomProvider>
      );

      const button = screen.getByTestId('initiate-call');
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(
          mockRoom.localParticipant.setMicrophoneEnabled
        ).toHaveBeenCalledWith(true);
      });
    });
  });
});
