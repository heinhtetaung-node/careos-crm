import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '__tests__/rtl-test-utils';

import AudioPlayer from '.';

// Mock ReactPlayer so ref points to a real media element and onDurationChange/onTimeUpdate fire (JSDOM does not load media)
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
    React.useLayoutEffect(() => {
      const el = typeof ref === 'object' && ref?.current ? ref.current : null;
      if (el) {
        Object.defineProperty(el, 'duration', {
          value: 100,
          configurable: true,
        });
        onDurationChange?.({ currentTarget: { duration: 100 } });
      }
    }, [onDurationChange, ref]);

    return (
      <video
        ref={ref}
        onTimeUpdate={onTimeUpdate}
        data-testid="mock-player"
        {...rest}
      />
    );
  });
});

// JSDOM does not implement HTMLMediaElement.play/pause; mock and update paused so UI reflects state
beforeEach(() => {
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
  // Allow setting currentTime to NaN/Infinity so Slider onChange does not throw when duration is 0 briefly
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

const audioUrl = (callId: string) =>
  `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/${callId}/recording`;

const mockAudios = [
  {
    url: audioUrl('c7b19607-b8b9-451f-a80c-cadbadb5f272'),
    date: '09/06/2022 (11:3:17 AM)',
    duration: '0:19 Min',
  },
  {
    url: audioUrl('ada36ae1-5e46-4ecf-9417-06bcbb4a651c'),
    date: '09/06/2022 (10:58:47 AM)',
    duration: '0:17 Min',
  },
  {
    url: audioUrl('a5e68c73-0220-457a-801a-099120cd10e3'),
    date: '09/06/2022 (10:58:23 AM)',
    duration: '0:08 Min',
  },
  {
    url: audioUrl('449f4111-a341-4f0b-aff6-2fe2334db7cf'),
    date: '09/06/2022 (10:58:2 AM)',
    duration: '0:08 Min',
  },
];

test('Should render audio player', () => {
  render(<AudioPlayer audios={mockAudios} color="primary" />);
  expect(screen.getByTestId('audio-player')).toBeTruthy();
});

test('Should render audio player with primary color', () => {
  render(<AudioPlayer audios={mockAudios} color="primary" />);
  const audioWrapper = screen.getByTestId('audio-player');
  expect(audioWrapper.className).toMatch(/-primary-/);
});

test('Should files list dropdown open', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const buttons = await screen.findAllByRole('button');
  expect(buttons[0]).toBeTruthy();

  await userEvent.click(buttons[0]);
  expect(screen.getByTestId('audio-files')).not.toHaveAttribute(
    'aria-hidden',
    'true'
  );
});

test('Should selected audio file from menu', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const buttons = await screen.findAllByRole('button');
  await userEvent.click(buttons[0]);

  const audioList = screen.getByTestId('audio-files');
  const menuItem = await within(audioList).findAllByRole('menuitem');
  expect(menuItem.length).toBe(4);

  await userEvent.click(menuItem[menuItem.length - 1]);
  expect(menuItem[menuItem.length - 1].className).toMatch(/Mui-selected/);
});

test('Should play the audio', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const buttons = await screen.findAllByRole('button');
  const playButton = buttons[1];
  expect(screen.getByTestId('audio-play')).toBeTruthy();

  await userEvent.click(playButton);

  expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
});

test('Should time-position show on progress bar when mouse hover', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const progress = await screen.getByTestId('audio-progress');
  await userEvent.hover(progress);

  expect(screen.getByTestId('time-position-hover')).toBeTruthy();
});

test('Should progress bar value change when clicked', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  await screen.findByText('01:40');
  const progress = screen.getByTestId('audio-progress').children[0];
  expect(progress).not.toBeNull();

  const video = document.querySelector('video');
  expect(video).toBeTruthy();
  Object.defineProperty(video, 'currentTime', {
    get: () => 50,
    configurable: true,
    enumerable: true,
  });
  fireEvent.timeUpdate(video!);

  await waitFor(() => {
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).not.toBe(
      '0'
    );
  });
});

test('Should show playback rate menu', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const buttons = await screen.findAllByRole('button');
  expect(buttons[2]).toBeTruthy();

  await userEvent.click(buttons[2]);
  expect(screen.getByTestId('playback-rates')).not.toHaveAttribute(
    'aria-hidden',
    'true'
  );
});

test('Should playback rate menu item selected', async () => {
  render(<AudioPlayer audios={mockAudios} />);
  const buttons = await screen.findAllByRole('button');
  await userEvent.click(buttons[2]);

  const speedList = screen.getByTestId('playback-rates');
  const rateItem = await within(speedList).findAllByRole('menuitem');
  expect(rateItem.length).toBe(3);

  await userEvent.click(rateItem[rateItem.length - 1]);
  expect(rateItem[rateItem.length - 1].className).toMatch(/Mui-selected/);
});
