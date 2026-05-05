import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import AudioPlayer from '.';

let mockMediaPaused = true;
let mockMediaCurrentTime = 0;
jest.mock('react-player', () => {
  const React = require('react');
  return React.forwardRef(function MockReactPlayer(
    {
      onDurationChange,
      onTimeUpdate,
      ...rest
    }: {
      onDurationChange?: (e: { currentTarget: { duration: number } }) => void;
      onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
      [key: string]: unknown;
    },
    ref: React.Ref<HTMLVideoElement>
  ) {
    const videoRef = React.useRef(null);
    React.useLayoutEffect(() => {
      if (ref && typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLMediaElement>).current = {
          play: () => {
            mockMediaPaused = false;
            return Promise.resolve();
          },
          pause: () => {
            mockMediaPaused = true;
          },
          get paused() {
            return mockMediaPaused;
          },
          get currentTime() {
            return mockMediaCurrentTime;
          },
          set currentTime(v: number) {
            mockMediaCurrentTime = v;
          },
          duration: 100,
        } as unknown as HTMLVideoElement;
      }
      onDurationChange?.({ currentTarget: { duration: 100 } });
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ref must be set only once so parent reads same object
    }, []);

    return (
      <video
        ref={videoRef}
        onTimeUpdate={onTimeUpdate}
        data-testid="mock-player"
        {...rest}
      />
    );
  });
});

const getMousePositionInElementMock = jest.fn();
jest.mock('../common/AudioPlayer/helpers', () => ({
  getMousePositionInElement: (...args: unknown[]) =>
    getMousePositionInElementMock(...args),
}));

let sliderOnChange: ((_: unknown, value: number) => void) | null = null;
let sliderOnChangeCommitted: (() => void) | null = null;
jest.mock('@material-ui/core/Slider', () => {
  const React = require('react');
  return function MockSlider(props: {
    onChange?: (e: unknown, value: number) => void;
    onChangeCommitted?: () => void;
    onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave?: () => void;
    value?: number;
    [key: string]: unknown;
  }) {
    sliderOnChange = props.onChange ?? null;
    sliderOnChangeCommitted = props.onChangeCommitted ?? null;
    return (
      <span
        data-testid="mock-slider"
        role="slider"
        aria-valuenow={props.value}
        onMouseMove={props.onMouseMove}
        onMouseLeave={props.onMouseLeave}
      />
    );
  };
});

beforeEach(() => {
  mockMediaPaused = true;
  mockMediaCurrentTime = 0;
  sliderOnChange = null;
  sliderOnChangeCommitted = null;
  getMousePositionInElementMock.mockReturnValue(10);
  window.HTMLMediaElement.prototype.play = jest
    .fn()
    .mockImplementation(function (this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', {
        value: false,
        configurable: true,
      });
      return Promise.resolve();
    });
  window.HTMLMediaElement.prototype.pause = jest
    .fn()
    .mockImplementation(function (this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', {
        value: true,
        configurable: true,
      });
    });
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'currentTime'
  );
  if (descriptor?.set) {
    const originalSet = descriptor.set;
    descriptor.set = function (this: HTMLMediaElement, value: number) {
      if (Number.isFinite(value)) originalSet!.call(this, value);
    };
    Object.defineProperty(
      HTMLMediaElement.prototype,
      'currentTime',
      descriptor
    );
  }
});

describe('AudioPlayer', () => {
  it('renders with src and shows play button', () => {
    render(<AudioPlayer src="https://example.com/audio.mp3" />);
    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      'https://example.com/audio.mp3'
    );
    expect(screen.getByTestId('play')).toBeInTheDocument();
  });

  it('calls play when play button is clicked', async () => {
    render(<AudioPlayer src="" />);
    await userEvent.click(screen.getByTestId('play'));
    expect(mockMediaPaused).toBe(false);
  });

  it('shows pause button when video is playing and calls pause when clicked', async () => {
    render(<AudioPlayer src="" />);
    const video = screen.getByTestId('mock-player');
    Object.defineProperty(video, 'currentTime', {
      get: () => 1,
      configurable: true,
      enumerable: true,
    });

    // Simulate "playing" state: ref.current.paused must be false when component re-renders
    mockMediaPaused = false;
    act(() => {
      fireEvent.timeUpdate(video);
    });

    expect(screen.getByTestId('pause')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('pause'));
    expect(mockMediaPaused).toBe(true);
  });

  it('displays duration and current time after duration is set', async () => {
    render(<AudioPlayer src="" />);
    const video = screen.getByTestId('mock-player');
    Object.defineProperty(video, 'currentTime', {
      get: () => 25,
      configurable: true,
      enumerable: true,
    });
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(screen.getByText('01:40')).toBeInTheDocument();
    });
    expect(screen.getByText('00:25')).toBeInTheDocument();
  });

  it('updates current time on timeUpdate', async () => {
    render(<AudioPlayer src="" />);
    const video = screen.getByTestId('mock-player');
    Object.defineProperty(video, 'currentTime', {
      get: () => 10,
      configurable: true,
      enumerable: true,
    });
    fireEvent.timeUpdate(video);
    await waitFor(() => {
      expect(screen.getByText('00:10')).toBeInTheDocument();
    });
  });

  it('pauses and seeks when slider is changed', async () => {
    render(<AudioPlayer src="" />);
    const video = screen.getByTestId('mock-player');
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(sliderOnChange).not.toBeNull();
    });

    act(() => {
      sliderOnChange!({} as React.ChangeEvent, 0.5);
    });

    expect(mockMediaPaused).toBe(true);
    expect(mockMediaCurrentTime).toBe(50);
  });

  it('calls play on slider changeCommitted', async () => {
    render(<AudioPlayer src="" />);
    const video = screen.getByTestId('mock-player');
    fireEvent.timeUpdate(video);

    await waitFor(() => {
      expect(sliderOnChangeCommitted).not.toBeNull();
    });

    act(() => {
      sliderOnChangeCommitted!();
    });

    expect(mockMediaPaused).toBe(false);
  });

  it('shows hover time on slider mouse move and hides on mouse leave', async () => {
    render(<AudioPlayer src="" />);
    const video = document.querySelector('video');
    fireEvent.timeUpdate(video!);

    await waitFor(() => {
      expect(screen.getByTestId('mock-slider')).toBeInTheDocument();
    });

    const sliderEl = screen.getByTestId('mock-slider');
    Object.defineProperty(sliderEl, 'offsetWidth', {
      value: 100,
      configurable: true,
    });

    fireEvent.mouseMove(sliderEl, { pageX: 50 });

    await waitFor(() => {
      const hoverTimes = document.querySelectorAll('.rhap__time--hover');
      expect(hoverTimes.length).toBe(1);
      expect(hoverTimes[0]).toHaveTextContent('00:10');
    });

    fireEvent.mouseLeave(sliderEl);

    await waitFor(() => {
      expect(document.querySelectorAll('.rhap__time--hover').length).toBe(0);
    });
  });

  it('does not set hover time when getMousePositionInElement returns negative', async () => {
    getMousePositionInElementMock.mockReturnValueOnce(-1);
    render(<AudioPlayer src="" />);
    const video = document.querySelector('video');
    fireEvent.timeUpdate(video!);

    await waitFor(() => {
      expect(screen.getByTestId('mock-slider')).toBeInTheDocument();
    });

    const sliderEl = screen.getByTestId('mock-slider');
    fireEvent.mouseMove(sliderEl, { pageX: 0 });

    expect(document.querySelectorAll('.rhap__time--hover').length).toBe(0);
  });

  it('renders total duration', async () => {
    render(<AudioPlayer src="" />);
    await waitFor(() => {
      expect(screen.getByText('01:40')).toBeInTheDocument();
    });
    const timeElements = document.querySelectorAll('.rhap__time');
    expect(timeElements.length).toBeGreaterThanOrEqual(1);
    const lastTime = timeElements[timeElements.length - 1];
    expect(lastTime).toHaveTextContent('01:40');
  });
});
