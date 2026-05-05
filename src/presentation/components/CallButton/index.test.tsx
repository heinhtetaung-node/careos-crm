import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallButton from './index';
import { PhoneNumber } from 'shared/types/customer';
import { CallButtonState } from './components/CallButtonGroup';

// Mock child components
jest.mock('./components/CallButtonGroup', () => {
  const actual = jest.requireActual('./components/CallButtonGroup');
  return {
    ...actual,
    __esModule: true,
    default: function MockCallButtonGroup({
      phoneNumberToCall,
      disabled,
      onStartCall,
      onToggleDropdown,
    }: {
      phoneNumberToCall: string;
      disabled: boolean;
      onStartCall: () => void;
      onToggleDropdown: () => void;
    }) {
      return (
        <div data-testid="call-button-group">
          <button
            type="button"
            data-testid="call-button"
            onClick={onStartCall}
            disabled={disabled}
          >
            Call {phoneNumberToCall}
          </button>
          <button
            type="button"
            data-testid="dropdown-toggle"
            onClick={onToggleDropdown}
            disabled={disabled}
          >
            Toggle
          </button>
        </div>
      );
    },
  };
});

jest.mock(
  './components/PhoneNumberDropdown',
  () =>
    function MockPhoneNumberDropdown({
      isOpen,
      phoneNumbers,
      selectedPhoneIndex,
      onClose,
      onPhoneSelect,
      onPhoneDelete,
    }: {
      isOpen: boolean;
      phoneNumbers: PhoneNumber[];
      selectedPhoneIndex: number;
      onClose: () => void;
      onPhoneSelect: (phone: string, phoneIndex: number) => void;
      onPhoneDelete?: (phone: string, phoneIndex: number) => void;
    }) {
      if (!isOpen) return null;
      return (
        <div data-testid="phone-number-dropdown">
          {phoneNumbers.map((item, index) => (
            <div
              key={`${item.phone}-${index}`}
              data-testid={`phone-item-${index}`}
            >
              <button
                type="button"
                data-testid={`select-phone-${index}`}
                onClick={() => onPhoneSelect(item.phone, index)}
              >
                {item.phone}
              </button>
              <button
                type="button"
                data-testid={`delete-phone-${index}`}
                onClick={() => onPhoneDelete?.(item.phone, index)}
              >
                Delete
              </button>
            </div>
          ))}
          <button type="button" data-testid="close-dropdown" onClick={onClose}>
            Close
          </button>
        </div>
      );
    }
);

describe('CallButton', () => {
  const mockPhoneNumbers: PhoneNumber[] = [
    { phone: '0999999999', status: 'verified' },
    { phone: '0888888888', status: 'unverified' },
    { phone: '0777777777', status: 'verified' },
  ];

  const mockOnStartCall = jest.fn();
  const mockOnEndCall = jest.fn();
  const mockOnPhoneSelect = jest.fn();
  const mockOnPhoneDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders CallButtonGroup with primary phone number', () => {
    render(
      <CallButton
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={0}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    expect(screen.getByTestId('call-button-group')).toBeInTheDocument();
    expect(screen.getByText('Call 0999999999')).toBeInTheDocument();
  });

  it('closes dropdown when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CallButton
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={0}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    // Open dropdown
    const toggleButton = screen.getByTestId('dropdown-toggle');
    await user.click(toggleButton);
    expect(screen.getByTestId('phone-number-dropdown')).toBeInTheDocument();

    // Close dropdown
    const closeButton = screen.getByTestId('close-dropdown');
    await user.click(closeButton);
    expect(
      screen.queryByTestId('phone-number-dropdown')
    ).not.toBeInTheDocument();
  });

  it('calls default onPhoneSelect when not provided', async () => {
    const user = userEvent.setup();
    render(
      <CallButton
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={0}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
      />
    );

    // Open dropdown
    const toggleButton = screen.getByTestId('dropdown-toggle');
    await user.click(toggleButton);
    expect(screen.getByTestId('phone-number-dropdown')).toBeInTheDocument();

    // Select a phone number - default function should be called (no-op)
    const selectButton = screen.getByTestId('select-phone-1');
    await user.click(selectButton);

    // Should not throw error - default function executed and dropdown should close
    expect(
      screen.queryByTestId('phone-number-dropdown')
    ).not.toBeInTheDocument();
  });

  it('calls default onPhoneDelete when not provided', async () => {
    const user = userEvent.setup();
    render(
      <CallButton
        buttonState={CallButtonState.ReadyToCall}
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={0}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
      />
    );

    // Open dropdown
    const toggleButton = screen.getByTestId('dropdown-toggle');
    await user.click(toggleButton);
    expect(screen.getByTestId('phone-number-dropdown')).toBeInTheDocument();

    // Delete a phone number - default function should be called (no-op)
    const deleteButton = screen.getByTestId('delete-phone-1');
    await user.click(deleteButton);

    // Should not throw error - default function executed and dropdown should close
    expect(
      screen.queryByTestId('phone-number-dropdown')
    ).not.toBeInTheDocument();
  });

  it('calls onStartCall with correct phone number and index when call button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CallButton
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={0}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    const callButton = screen.getByTestId('call-button');
    await user.click(callButton);

    expect(mockOnStartCall).toHaveBeenCalledTimes(1);
    expect(mockOnStartCall).toHaveBeenCalledWith(mockPhoneNumbers[0].phone, 0);
  });

  it('calls onStartCall with correct phone number and index for different primary phone index', async () => {
    const user = userEvent.setup();
    render(
      <CallButton
        phoneNumbers={mockPhoneNumbers}
        primaryPhoneIndex={2}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    const callButton = screen.getByTestId('call-button');
    await user.click(callButton);

    expect(mockOnStartCall).toHaveBeenCalledTimes(1);
    expect(mockOnStartCall).toHaveBeenCalledWith(mockPhoneNumbers[2].phone, 2);
  });
});
