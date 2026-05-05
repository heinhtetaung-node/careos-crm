import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import CallTimer from './index';

jest.useFakeTimers();

describe('CallTimer', () => {
  test('should not start unitl show timer is true', () => {
    const { rerender } = render(<CallTimer showTimer={false} />);
    expect(screen.queryByText('00:00')).not.toBeInTheDocument();
    rerender(<CallTimer showTimer />);
    expect(screen.queryByText('00:00')).toBeInTheDocument();
  });

  test.skip('should not reset the timer after prop change', async () => {
    const { rerender } = render(<CallTimer showTimer />);
    jest.advanceTimersByTime(1000);
    await waitFor(() =>
      expect(screen.queryByText('00:01')).toBeInTheDocument()
    );
    rerender(<CallTimer showTimer={false} />);
    jest.advanceTimersByTime(1000);
    rerender(<CallTimer showTimer />);
    expect(screen.queryByText('00:01')).toBeInTheDocument();
  });
});
