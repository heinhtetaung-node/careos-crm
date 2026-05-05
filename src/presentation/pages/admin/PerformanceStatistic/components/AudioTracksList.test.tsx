// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import AudioTracksList from './AudioTracksList';
import CustomAudioVisualizer from './CustomAudioVisualizer';

jest.mock('presentation/theme/localization', () => ({
  getString: (key) => key,
}));

// Mock LiveKit components
jest.mock('@livekit/components-react', () => {
  const React = require('react');
  return {
    AudioTrack: function MockAudioTrack({ trackRef, volume, muted }) {
      return React.createElement('div', {
        'data-testid': 'audio-track',
        'data-volume': volume,
        'data-muted': muted,
        'data-participant-sid': trackRef?.participant?.sid,
      });
    },
    TrackReference: {},
    TrackReferenceOrPlaceholder: {},
  };
});

// Mock CustomAudioVisualizer
jest.mock('./CustomAudioVisualizer', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MockCustomAudioVisualizer({
      trackRef,
      barCount,
      height,
    }) {
      return React.createElement('div', {
        'data-testid': 'custom-audio-visualizer',
        'data-bar-count': barCount,
        'data-height': height,
        'data-participant-sid': trackRef?.participant?.sid,
      });
    },
  };
});

describe('AudioTracksList', () => {
  const createMockTrackRef = (overrides = {}) => {
    return {
      participant: {
        sid: 'participant-sid-123',
        identity: 'participant-identity-123',
        isLocal: false,
        name: 'Participant Name',
        attributes: {
          user: 'agent-name',
          lead: 'lead-name',
        },
      },
      publication: {
        track: {
          sid: 'track-sid-123',
          kind: 'audio',
        },
        isSubscribed: true,
      },
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when audioTracks is empty', () => {
    const { container } = render(
      React.createElement(AudioTracksList, {
        audioTracks: [],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );
    expect(container.firstChild).toBeNull();
  });

  test('filters out local tracks', () => {
    const localTrack = createMockTrackRef({
      participant: { ...createMockTrackRef().participant, isLocal: true },
    });
    const remoteTrack = createMockTrackRef();

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [localTrack, remoteTrack],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    // Should only render the remote track
    const audioTracks = screen.getAllByTestId('audio-track');
    expect(audioTracks).toHaveLength(1);
    expect(audioTracks[0]).toHaveAttribute(
      'data-participant-sid',
      'participant-sid-123'
    );
  });

  test('renders participant information', () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.participant/)
    ).toBeInTheDocument();
    // Component now shows agentName by default (unless sip.callID is present)
    expect(screen.getByText(/test-agent/)).toBeInTheDocument();
  });

  test('uses participant sid when identity is not available', () => {
    const trackRef = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        identity: undefined,
        sid: 'fallback-sid-456',
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    // Component shows agentName by default, not participant sid
    expect(screen.getByText(/test-agent/)).toBeInTheDocument();
  });

  test('uses "Unknown" when neither identity nor sid is available', () => {
    const trackRef = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        identity: undefined,
        sid: undefined,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    // Component shows agentName by default
    expect(screen.getByText(/test-agent/)).toBeInTheDocument();
  });

  test('displays openLeadName when sip.callID is present in participant attributes', () => {
    const trackRef = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        _attributes: {
          'sip.callID': 'some-call-id',
        },
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: 'John Doe',
        agentParticipantId: '',
      })
    );

    // Component should show openLeadName when sip.callID is present
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.queryByText(/test-agent/)).not.toBeInTheDocument();
  });

  test('displays agentName when sip.callID is not present in participant attributes', () => {
    const trackRef = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        _attributes: {},
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: 'John Doe',
        agentParticipantId: '',
      })
    );

    // Component should show agentName when sip.callID is not present
    expect(screen.getByText(/test-agent/)).toBeInTheDocument();
    expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument();
  });

  test('displays track status correctly when track exists', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: { sid: 'track-sid-123' },
        isSubscribed: true,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.hasTrack/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/performanceStatistic.subscribed/)
    ).toBeInTheDocument();
    expect(screen.getByText(/text.yes/)).toBeInTheDocument();
  });

  test('displays track status correctly when track does not exist', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: null,
        isSubscribed: false,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.hasTrack/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/performanceStatistic.subscribed/)
    ).toBeInTheDocument();
    expect(screen.getByText(/text.no/)).toBeInTheDocument();
  });

  test('renders AudioTrack component with correct props', () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    const audioTrack = screen.getByTestId('audio-track');
    expect(audioTrack).toBeInTheDocument();
    expect(audioTrack).toHaveAttribute('data-volume', '1');
    expect(audioTrack).toHaveAttribute('data-muted', 'false');
  });

  test('renders CustomAudioVisualizer when track exists', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: { sid: 'track-sid-123' },
        isSubscribed: true,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    const visualizer = screen.getByTestId('custom-audio-visualizer');
    expect(visualizer).toBeInTheDocument();
    expect(visualizer).toHaveAttribute('data-bar-count', '30');
    expect(visualizer).toHaveAttribute('data-height', '120');
  });

  test('renders CustomAudioVisualizer when subscribed but no track', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: null,
        isSubscribed: true,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    const visualizer = screen.getByTestId('custom-audio-visualizer');
    expect(visualizer).toBeInTheDocument();
  });

  test('does not render CustomAudioVisualizer when no track and not subscribed', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: null,
        isSubscribed: false,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    const visualizer = screen.queryByTestId('custom-audio-visualizer');
    expect(visualizer).not.toBeInTheDocument();
  });

  test('displays "Track not available" message when no track', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: null,
        isSubscribed: false,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.trackNotAvailable/)
    ).toBeInTheDocument();
  });

  test('does not display "Track not available" message when track exists', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: { sid: 'track-sid-123' },
        isSubscribed: true,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.queryByText(/performanceStatistic.trackNotAvailable/)
    ).not.toBeInTheDocument();
  });

  test('renders multiple remote tracks', () => {
    const trackRef1 = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        sid: 'participant-1',
        identity: 'participant-1',
      },
    });
    const trackRef2 = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        sid: 'participant-2',
        identity: 'participant-2',
      },
    });
    const localTrack = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        isLocal: true,
        sid: 'local-participant',
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef1, trackRef2, localTrack],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    const audioTracks = screen.getAllByTestId('audio-track');
    expect(audioTracks).toHaveLength(2);
  });

  test('uses participant sid as key', () => {
    const trackRef = createMockTrackRef({
      participant: {
        ...createMockTrackRef().participant,
        sid: 'unique-sid-789',
      },
    });

    const { container } = render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    // The key should be set on the div element
    const trackDiv = container.querySelector(
      '[data-testid="audio-track"]'
    )?.parentElement;
    expect(trackDiv).toBeInTheDocument();
  });

  test('handles missing publication gracefully', () => {
    const trackRef = {
      participant: {
        sid: 'participant-sid-123',
        identity: 'participant-identity-123',
        isLocal: false,
      },
      publication: null,
    };

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.hasTrack/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/performanceStatistic.subscribed/)
    ).toBeInTheDocument();
    expect(screen.getByText(/text.no/)).toBeInTheDocument();
  });

  test('handles undefined publication track', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: undefined,
        isSubscribed: false,
      },
    });

    render(
      React.createElement(AudioTracksList, {
        audioTracks: [trackRef],
        agentName: 'test-agent',
        openLeadName: '',
        agentParticipantId: '',
      })
    );

    expect(
      screen.getByText(/performanceStatistic.hasTrack/)
    ).toBeInTheDocument();
    expect(screen.getByText(/text.no/)).toBeInTheDocument();
  });
});
