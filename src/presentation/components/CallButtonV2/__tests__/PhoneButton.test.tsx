import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PhoneButton from '../PhoneButton';

describe('PhoneButton', () => {
  it('should show call button in idle state', () => {
    render(
      <PhoneButton
        customerId=""
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="idle"
      />
    );
    expect(screen.getByTestId('start-call-button')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'text.hangUp' })
    ).not.toBeInTheDocument();
  });

  it('should show call button with disable on connecting state', () => {
    render(
      <PhoneButton
        customerId=""
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="connecting"
      />
    );
    const callBtn = screen.getByTestId('start-call-button');
    expect(callBtn).toBeInTheDocument();
    expect(callBtn).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'text.hangUp' })
    ).not.toBeInTheDocument();
  });

  it('should show call button and hangup in ringing state', () => {
    render(
      <PhoneButton
        customerId=""
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="ringing"
      />
    );
    const callBtn = screen.getByTestId('start-call-button');
    expect(callBtn).toBeInTheDocument();
    expect(callBtn).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'text.hangUp' })
    ).toBeInTheDocument();
  });

  it('should only show hangup in incall state', () => {
    render(
      <PhoneButton
        customerId=""
        startCall={jest.fn()}
        endCall={jest.fn()}
        callState="incall"
      />
    );
    expect(screen.queryByTestId('start-call-button')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.hangUp 00:00' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('call-time')).toBeInTheDocument();
  });

  it('should enable selecting the available phone number and show delete icon', async () => {
    render(
      <PhoneButton customerId="" startCall={jest.fn()} endCall={jest.fn()} />,
      {
        initialState: {
          leadsDetailReducer: {
            lead: {
              payload: {
                data: {
                  customerPhoneNumber: [
                    { phone: '0999999999', status: 'verify' },
                    { phone: '0888888888', status: 'verify' },
                  ],
                  primaryPhoneIndex: 0,
                },
              },
            },
          },
        },
      }
    );
    expect(screen.getByTestId('start-call-button')).toHaveTextContent(
      'text.call099999****'
    );
    await userEvent.click(screen.getByTestId('phone-menu-btn'));
    await userEvent.click(
      screen.getByRole('menuitem', { name: '088888**** text.verify' })
    );
    expect(screen.getByTestId('start-call-button')).toHaveTextContent(
      'text.call099999****'
    );
  });

  it('should call startCall with selected phone index', async () => {
    const mockFn = jest.fn();
    render(
      <PhoneButton customerId="" startCall={mockFn} endCall={jest.fn()} />,
      {
        initialState: {
          leadsDetailReducer: {
            lead: {
              payload: {
                name: 'leadName',
                data: {
                  customerPhoneNumber: [
                    { phone: '0999999999', status: 'verify' },
                    { phone: '0888888888', status: 'verify' },
                  ],
                  primaryPhoneIndex: 0,
                },
              },
            },
          },
        },
      }
    );
    await userEvent.click(screen.getByTestId('start-call-button'));
    expect(mockFn).toHaveBeenCalledWith('leadName', 0);
  });

  it('should call endCall on end call', async () => {
    const mockFn = jest.fn();
    render(
      <PhoneButton
        customerId=""
        startCall={jest.fn()}
        endCall={mockFn}
        callState="incall"
      />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'text.hangUp 00:00' })
    );
    expect(mockFn).toHaveBeenCalled();
  });
});
