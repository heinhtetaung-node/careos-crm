import React from 'react';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '__tests__/rtl-test-utils';

import CopyToClipboard from '.';

jest.useFakeTimers();

describe('CopyToClipboard', () => {
  it('should renders successfully', () => {
    render(<CopyToClipboard text="test-id" />);
    expect(screen.queryByText('test-id')).toBeInTheDocument();
  });

  it('should copy lead ID show tooltip and then hide it', async () => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: jest.fn(),
      },
    });
    render(<CopyToClipboard text="test-id" />);
    fireEvent.click(screen.getByTestId('unittest-copy-content-btn'));
    await waitFor(() => {
      expect(screen.getByText('text.copied')).toBeInTheDocument();
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    screen.queryByText('text.copied');
  });
});
