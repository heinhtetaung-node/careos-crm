import React from 'react';

import { act, render, screen } from '__tests__/rtl-test-utils';

import CallAudio from '../CallAudio';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

import { useSelector } from 'react-redux';

/** @type {jest.Mock} */
const mockUseSelector = useSelector;

describe('CallAudio', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockUseSelector.mockReturnValue({
      status: 'idle',
      audio: undefined,
      timer: 0,
    });
    if (typeof global.MediaStream === 'undefined') {
      function MockMediaStream() {}
      global.MediaStream = MockMediaStream;
    }
  });

  it('renders audio element with captions track', () => {
    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute('autoplay');
    expect(audio.loop).toBe(false);
    expect(
      audio.querySelector('track[kind="captions"][label="lead_call"]')
    ).toBeInTheDocument();
  });

  it('when status is idle does not configure media from call branches', () => {
    mockUseSelector.mockReturnValue({
      status: 'idle',
      audio: undefined,
      timer: 0,
    });
    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;
    expect(audio.src).toBe('');
    expect(audio.srcObject == null).toBe(true);
  });

  it('when status is ended plays bleep then clears src after delay', () => {
    jest.useFakeTimers();
    mockUseSelector.mockReturnValue({
      status: 'ended',
      audio: undefined,
      timer: 0,
    });

    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;

    expect(audio.src).toContain('bleep.mp3');
    expect(audio.srcObject).toBeNull();
    expect(audio.volume).toBe(0.05);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(audio.getAttribute('src')).toBe('');
  });

  it('when status is ended unmount clears timeout', () => {
    jest.useFakeTimers();
    mockUseSelector.mockReturnValue({
      status: 'ended',
      audio: undefined,
      timer: 0,
    });

    const { unmount } = render(<CallAudio />);
    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });

  it('when status is reconnecting plays reconnect sound on loop', () => {
    mockUseSelector.mockReturnValue({
      status: 'reconnecting',
      audio: undefined,
      timer: 0,
    });

    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;

    expect(audio.src).toContain('reconnect.mp3');
    expect(audio.srcObject).toBeNull();
    expect(audio.volume).toBe(0.5);
    expect(audio.loop).toBe(true);
  });

  it('when status is ringing attaches first audio stream', () => {
    const stream = new MediaStream();
    mockUseSelector.mockReturnValue({
      status: 'ringing',
      audio: [stream],
      timer: 0,
    });

    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;

    expect(audio.srcObject).toBe(stream);
    expect(audio.volume).toBe(1);
  });

  it('when status is incall attaches first audio stream', () => {
    const stream = new MediaStream();
    mockUseSelector.mockReturnValue({
      status: 'incall',
      audio: [stream],
      timer: 0,
    });

    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;

    expect(audio.srcObject).toBe(stream);
    expect(audio.volume).toBe(1);
  });

  it('when ringing with missing audio stream sets volume and clears stream', () => {
    mockUseSelector.mockReturnValue({
      status: 'ringing',
      audio: undefined,
      timer: 0,
    });

    render(<CallAudio />);
    const audio = screen.getByTestId(
      'unittest-audio-track'
    ) as HTMLAudioElement;

    expect(audio.volume).toBe(1);
    expect(audio.srcObject == null).toBe(true);
  });
});
