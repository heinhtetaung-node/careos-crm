import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CallButton from '..';

var mockHook: jest.Mock;

jest.mock('presentation/hooks/useCareosCall', () => {
  mockHook = jest.fn();
  return mockHook;
});

describe('CallButton', () => {
  beforeEach(() => mockHook.mockClear());

  it('should call onCallStatus on status change to ringing', async () => {
    mockHook.mockImplementation(({ onStatusChange }) => {
      onStatusChange('ringing');
      return {
        status: 'idle',
        startCall: jest.fn(),
        endCall: jest.fn(),
      };
    });
    const mockFn = jest.fn();
    render(
      <CallButton customerId="" onCallStart={mockFn} onCallEnd={jest.fn()} />
    );
    await userEvent.click(screen.getByTestId('start-call-button'));
    expect(mockFn).toHaveBeenCalled();
  });

  it('should call onCallStatus on status change to ended', async () => {
    mockHook.mockImplementation(({ onStatusChange }) => {
      onStatusChange('ended');
      return {
        status: 'idle',
        startCall: jest.fn(),
        endCall: jest.fn(),
      };
    });
    const mockFn = jest.fn();
    render(
      <CallButton customerId="" onCallStart={jest.fn()} onCallEnd={mockFn} />
    );
    await userEvent.click(screen.getByTestId('start-call-button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
