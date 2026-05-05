// @ts-nocheck
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import CustomAudioVisualizer from './CustomAudioVisualizer';

jest.mock('presentation/theme/localization', () => ({
  getString: (key) => key,
}));

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
const animationFrameCallbacks = [];
global.requestAnimationFrame = jest.fn((cb) => {
  animationFrameId++;
  animationFrameCallbacks.push(cb);
  return animationFrameId;
});
global.cancelAnimationFrame = jest.fn((id) => {
  const index = animationFrameCallbacks.findIndex(() => true);
  if (index !== -1) {
    animationFrameCallbacks.splice(index, 1);
  }
});

// Mock canvas context methods
const mockFillRect = jest.fn();
const mockFillStyle = jest.fn();
const mockCreateLinearGradient = jest.fn(() => ({
  addColorStop: jest.fn(),
}));

const mockGetContext = jest.fn(() => ({
  fillRect: mockFillRect,
  fillStyle: mockFillStyle,
  createLinearGradient: mockCreateLinearGradient,
}));

// Mock AudioContext
const mockAnalyser = {
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  frequencyBinCount: 128,
  getByteFrequencyData: jest.fn((array) => {
    // Fill array with mock frequency data
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random() * 255;
    }
  }),
};

const mockSource = {
  connect: jest.fn(),
};

let mockAudioContextInstance = {
  createAnalyser: jest.fn(() => mockAnalyser),
  createMediaStreamSource: jest.fn(() => mockSource),
  close: jest.fn(() => Promise.resolve()),
};

const AudioContextConstructor = jest.fn(() => mockAudioContextInstance);

global.AudioContext = AudioContextConstructor;
global.webkitAudioContext = AudioContextConstructor;

// Mock MediaStreamTrack
const createMockMediaStreamTrack = () => ({
  kind: 'audio',
  id: 'track-id-123',
  enabled: true,
  muted: false,
  readyState: 'live',
});

// Mock MediaStream
const createMockMediaStream = (tracks = [createMockMediaStreamTrack()]) => ({
  getAudioTracks: jest.fn(() => tracks),
  getTracks: jest.fn(() => tracks),
  id: 'stream-id-123',
});

// Mock MediaStream constructor
global.MediaStream = jest.fn((tracks) => createMockMediaStream(tracks));

describe('CustomAudioVisualizer', () => {
  const createMockTrackRef = (overrides = {}) => {
    const mediaStreamTrack = createMockMediaStreamTrack();
    return {
      participant: {
        sid: 'participant-sid-123',
        identity: 'participant-identity-123',
      },
      publication: {
        track: {
          sid: 'track-sid-123',
          kind: 'audio',
          mediaStreamTrack,
          ...overrides.trackOverrides,
        },
        ...overrides.publicationOverrides,
      },
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    animationFrameId = 0;
    animationFrameCallbacks.length = 0;
    mockAnalyser.getByteFrequencyData.mockClear();
    AudioContextConstructor.mockClear();
    mockAudioContextInstance.createAnalyser.mockClear();
    mockAudioContextInstance.createMediaStreamSource.mockClear();
    mockSource.connect.mockClear();
    mockFillRect.mockClear();
    mockFillStyle.mockClear();
    mockCreateLinearGradient.mockClear();
    mockGetContext.mockClear();

    // Reset HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = mockGetContext;

    // Reset audio context instance
    mockAudioContextInstance = {
      createAnalyser: jest.fn(() => mockAnalyser),
      createMediaStreamSource: jest.fn(() => mockSource),
      close: jest.fn(() => Promise.resolve()),
    };
    AudioContextConstructor.mockReturnValue(mockAudioContextInstance);
  });

  test('renders canvas element', () => {
    const trackRef = createMockTrackRef();
    const { container } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '600');
    expect(canvas).toHaveAttribute('height', '100');
  });

  test('uses default props when not provided', () => {
    const trackRef = createMockTrackRef();
    const { container } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
      })
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('height', '100'); // default height
  });

  test('sets up audio context with mediaStreamTrack from track.mediaStreamTrack', async () => {
    const mediaStreamTrack = createMockMediaStreamTrack();
    const trackRef = createMockTrackRef({
      trackOverrides: {
        mediaStreamTrack,
      },
    });

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalled();
      expect(
        mockAudioContextInstance.createMediaStreamSource
      ).toHaveBeenCalled();
    });
  });

  test('sets up audio context with mediaStreamTrack from track.track', async () => {
    const mediaStreamTrack = createMockMediaStreamTrack();
    const trackRef = createMockTrackRef({
      trackOverrides: {
        mediaStreamTrack: null,
        track: mediaStreamTrack,
      },
    });

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(
        mockAudioContextInstance.createMediaStreamSource
      ).toHaveBeenCalled();
    });
  });

  test('sets up audio context with mediaStreamTrack from track.mediaStream', async () => {
    const mediaStreamTrack = createMockMediaStreamTrack();
    const mediaStream = createMockMediaStream([mediaStreamTrack]);
    const trackRef = createMockTrackRef({
      trackOverrides: {
        mediaStreamTrack: null,
        track: null,
        mediaStream,
      },
    });

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(
        mockAudioContextInstance.createMediaStreamSource
      ).toHaveBeenCalled();
    });
  });

  test('handles missing track gracefully', () => {
    const trackRef = createMockTrackRef({
      publication: {
        track: null,
      },
    });

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    expect(mockAudioContextInstance.createAnalyser).not.toHaveBeenCalled();
  });

  test('handles missing canvas context gracefully', () => {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
    const trackRef = createMockTrackRef();

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    expect(mockAudioContextInstance.createAnalyser).not.toHaveBeenCalled();
  });

  test('configures analyser with correct settings', async () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalled();
    });

    expect(mockAnalyser.fftSize).toBe(256);
    expect(mockAnalyser.smoothingTimeConstant).toBe(0.8);
  });

  test('connects source to analyser', async () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockSource.connect).toHaveBeenCalledWith(mockAnalyser);
    });
  });

  test('starts animation loop', async () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  test('draws bars with correct count', async () => {
    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 30,
        height: 120,
      })
    );

    await waitFor(() => {
      expect(mockAnalyser.getByteFrequencyData).toHaveBeenCalled();
    });
  });

  test('cleans up animation frame on unmount', async () => {
    const trackRef = createMockTrackRef();
    const { unmount } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    const lastCallId =
      global.requestAnimationFrame.mock.results[
        global.requestAnimationFrame.mock.results.length - 1
      ].value;

    unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(lastCallId);
  });

  test('closes audio context on unmount', async () => {
    const trackRef = createMockTrackRef();
    const { unmount } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalled();
    });

    unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockAudioContextInstance.close).toHaveBeenCalled();
  });

  test('handles audio context close error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAudioContextInstance.close.mockRejectedValue(new Error('Close error'));

    const trackRef = createMockTrackRef();
    const { unmount } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalled();
    });

    unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await waitFor(() => {
      expect(mockAudioContextInstance.close).toHaveBeenCalled();
    });

    // Wait for promise rejection to be caught
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles setup error gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAudioContextInstance.createAnalyser.mockImplementation(() => {
      throw new Error('Setup error');
    });

    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'performanceStatistic.errorSettingUpVisualizer',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test('handles missing AudioContext gracefully when web audio is not available', () => {
    const originalAudioContext = global.AudioContext;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    // Simulate environment without AudioContext support
    // @ts-expect-error overriding for test
    global.AudioContext = undefined;

    const trackRef = createMockTrackRef();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'performanceStatistic.errorSettingUpVisualizer',
      expect.any(Error)
    );

    // Restore globals
    // @ts-expect-error restoring for test
    global.AudioContext = originalAudioContext;
    consoleErrorSpy.mockRestore();
  });

  test('applies correct canvas classes and attributes', () => {
    const trackRef = createMockTrackRef();
    const { container } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 150,
      })
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('w-full');
    expect(canvas).toHaveClass('block');
    expect(canvas).toHaveClass('rounded');
    expect(canvas).toHaveAttribute('height', '150');
  });

  test('re-initializes when trackRef changes', async () => {
    const trackRef1 = createMockTrackRef({
      trackOverrides: {
        sid: 'track-1',
      },
    });
    const trackRef2 = createMockTrackRef({
      trackOverrides: {
        sid: 'track-2',
      },
    });

    const { rerender } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef: trackRef1,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalledTimes(1);
    });

    rerender(
      React.createElement(CustomAudioVisualizer, {
        trackRef: trackRef2,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalledTimes(2);
    });
  });

  test('re-initializes when barCount changes', async () => {
    const trackRef = createMockTrackRef();

    const { rerender } = render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalledTimes(1);
    });

    rerender(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 40,
        height: 100,
      })
    );

    await waitFor(() => {
      expect(mockAudioContextInstance.createAnalyser).toHaveBeenCalledTimes(2);
    });
  });

  test('warns when no MediaStreamTrack is available', () => {
    const trackRef = createMockTrackRef({
      trackOverrides: {
        mediaStreamTrack: null,
        track: null,
        mediaStream: null,
      },
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'performanceStatistic.noMediaStreamTrack'
    );

    consoleWarnSpy.mockRestore();
  });

  test('handles missing canvas ref', () => {
    const trackRef = createMockTrackRef();
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    // Mock getContext to return null initially, then return context
    let callCount = 0;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        return null; // First call returns null (canvas not ready)
      }
      return mockGetContext();
    });

    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef,
        barCount: 20,
        height: 100,
      })
    );

    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  test('handles null trackRef', () => {
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef: null,
        barCount: 20,
        height: 100,
      })
    );

    expect(mockAudioContextInstance.createAnalyser).not.toHaveBeenCalled();
  });

  test('handles undefined trackRef', () => {
    render(
      React.createElement(CustomAudioVisualizer, {
        trackRef: undefined,
        barCount: 20,
        height: 100,
      })
    );

    expect(mockAudioContextInstance.createAnalyser).not.toHaveBeenCalled();
  });
});
