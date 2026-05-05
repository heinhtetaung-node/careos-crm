import React from 'react';
import { render, screen, waitFor, fireEvent } from '__tests__/rtl-test-utils';
import SimpleCallButton from './SimpleCallButton';
import { LiveKitCallStatus } from './LivekitRoomProvider';

// Mock dependencies
let mockLiveKitCallStatus = LiveKitCallStatus.Idle;
let mockCallDuration = 0;
const mockEnsureMicrophonePermission = jest.fn().mockResolvedValue(true);
const mockInitiateCall = jest.fn().mockResolvedValue('test-call-name');
const mockDialPhoneNumber = jest.fn().mockResolvedValue(undefined);
const mockEndCall = jest.fn().mockResolvedValue(undefined);
const mockShowErrorSnackbar = jest.fn();

jest.mock('./LivekitRoomProvider', () => ({
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
    endCall: mockEndCall,
    liveKitCallStatus: mockLiveKitCallStatus,
    callDuration: mockCallDuration,
  }),
}));

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: () => ({
    showErrorSnackbar: mockShowErrorSnackbar,
    showSuccessSnackbar: jest.fn(),
  }),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock(
  './Counter',
  () =>
    function MockCounter({ duration }: { duration: number }) {
      return <div data-testid="counter">{duration}s</div>;
    }
);

describe('SimpleCallButton', () => {
  const defaultProps = {
    agentName: 'Test Agent',
    leadName: 'leads/test-lead-id',
    phoneIndex: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLiveKitCallStatus = LiveKitCallStatus.Idle;
    mockCallDuration = 0;
    mockEnsureMicrophonePermission.mockResolvedValue(true);
    mockInitiateCall.mockResolvedValue('test-call-name');
    mockDialPhoneNumber.mockResolvedValue(undefined);
    mockEndCall.mockResolvedValue(undefined);
  });

  describe('Rendering different call states', () => {
    it('renders call button when status is Idle', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      expect(callButton).toBeInTheDocument();
      expect(callButton).toHaveTextContent('Call');
    });

    it('renders call button when status is Ended', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Ended;
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      expect(callButton).toBeInTheDocument();
    });

    it('renders loading spinner when status is AgentConnecting', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.AgentConnecting;
      render(<SimpleCallButton {...defaultProps} />);

      // Material-UI CircularProgress renders as an SVG circle
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /call/i })
      ).not.toBeInTheDocument();
    });

    it('renders end call button when status is AgentConnected', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.AgentConnected;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByText('text.hangUp')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /call/i })
      ).not.toBeInTheDocument();
    });

    it('renders end call button when status is DialingLead', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.DialingLead;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    });

    it('renders end call button when status is Ringing', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Ringing;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    });

    it('renders end call button when status is Active', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Active;
      mockCallDuration = 120;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByText('text.hangUp')).toBeInTheDocument();
      expect(screen.getByTestId('counter')).toBeInTheDocument();
      expect(screen.getByTestId('counter')).toHaveTextContent('120s');
    });
  });

  describe('Call button click behavior', () => {
    it('initiates call flow when call button is clicked', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockEnsureMicrophonePermission).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockInitiateCall).toHaveBeenCalledWith('Test Agent');
      });

      await waitFor(() => {
        expect(mockDialPhoneNumber).toHaveBeenCalledWith(
          'test-call-name',
          'leads/test-lead-id',
          0
        );
      });
    });

    it('shows error snackbar when microphone permission is denied', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      mockEnsureMicrophonePermission.mockResolvedValue(false);
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockEnsureMicrophonePermission).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'text.microphonePermissionDenied'
        );
      });

      // Should not proceed with call initiation
      expect(mockInitiateCall).not.toHaveBeenCalled();
      expect(mockDialPhoneNumber).not.toHaveBeenCalled();
    });

    it('shows error snackbar when call initiation fails', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      const error = new Error('Call initiation failed');
      mockInitiateCall.mockRejectedValue(error);
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockEnsureMicrophonePermission).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'text.callStartFailed'
        );
      });

      // Should not proceed with dialing
      expect(mockDialPhoneNumber).not.toHaveBeenCalled();
    });

    it('shows error snackbar when dialing fails', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      const error = new Error('Dialing failed');
      mockDialPhoneNumber.mockRejectedValue(error);
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'text.callStartFailed'
        );
      });
    });

    it('calls initiateCall and dialPhoneNumber with correct parameters', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      render(
        <SimpleCallButton
          agentName="John Doe"
          leadName="leads/abc-123"
          phoneIndex={2}
        />
      );

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockInitiateCall).toHaveBeenCalledWith('John Doe');
      });

      await waitFor(() => {
        expect(mockDialPhoneNumber).toHaveBeenCalledWith(
          'test-call-name',
          'leads/abc-123',
          2
        );
      });
    });
  });

  describe('End call button behavior', () => {
    it('calls endCall when end call button is clicked', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Active;
      render(<SimpleCallButton {...defaultProps} />);

      const endCallButton = screen.getByText('text.hangUp').closest('button');
      expect(endCallButton).toBeInTheDocument();

      fireEvent.click(endCallButton!);

      expect(mockEndCall).toHaveBeenCalledTimes(1);
    });

    it('displays call duration counter when call is active', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Active;
      mockCallDuration = 300;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByTestId('counter')).toBeInTheDocument();
      expect(screen.getByTestId('counter')).toHaveTextContent('300s');
    });

    it('displays call duration counter when call is ringing', () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Ringing;
      mockCallDuration = 45;
      render(<SimpleCallButton {...defaultProps} />);

      expect(screen.getByTestId('counter')).toBeInTheDocument();
      expect(screen.getByTestId('counter')).toHaveTextContent('45s');
    });
  });

  describe('Error handling', () => {
    it('handles errors gracefully during call flow', async () => {
      mockLiveKitCallStatus = LiveKitCallStatus.Idle;
      mockEnsureMicrophonePermission.mockRejectedValue(
        new Error('Permission error')
      );
      render(<SimpleCallButton {...defaultProps} />);

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.click(callButton);

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'text.callStartFailed'
        );
      });
    });
  });
});
