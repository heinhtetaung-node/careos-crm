import React from 'react';
import { render, screen } from '@testing-library/react';
import CallButtonGroup, { CallButtonState } from './CallButtonGroup';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('@alphafounders/icons', () => ({
  PhoneOutlineIcon: () => <div data-testid="phone-outline-icon" />,
}));

jest.mock('@material-ui/core', () => ({
  CircularProgress: () => <div data-testid="circular-progress" />,
}));

jest.mock('@material-ui/icons', () => ({
  PhoneInTalk: () => <div data-testid="phone-in-talk-icon" />,
}));

jest.mock('@material-ui/icons/ArrowDropDown', () => ({
  __esModule: true,
  default: () => <div data-testid="arrow-dropdown-icon" />,
}));

jest.mock('presentation/components/controls/Control', () => ({
  __esModule: true,
  default: {
    Button: ({ children, onClick, startIcon, ...props }: any) => (
      <button type="button" onClick={onClick} {...props}>
        {startIcon}
        {children}
      </button>
    ),
  },
}));

jest.mock('presentation/components/CallButtonLiveKit/Counter', () => ({
  __esModule: true,
  default: ({ duration }: { duration: number }) =>
    duration > 0 ? <div data-testid="counter">00:00</div> : null,
}));

describe('CallButtonGroup', () => {
  const mockOnStartCall = jest.fn();
  const mockOnEndCall = jest.fn();
  const mockOnToggleDropdown = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders call button with phone number when ready to call', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    // The Call text is in a span with className "text-sm font-bold"
    const callSpan = screen.getByText('Call', { selector: 'span' });
    expect(callSpan).toBeInTheDocument();

    // Check for masked phone number (0999999999 becomes 099999****)
    expect(screen.getByText('099999****')).toBeInTheDocument();
  });

  it('renders connecting state with loading spinner', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) => btn.textContent?.includes('Call'));
    expect(callButton).toBeDisabled();
  });

  it('renders hang up button when in call', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.InCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
        callDuration={1}
      />
    );

    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    expect(screen.getByTestId('counter')).toBeInTheDocument();
  });

  it('renders hang up button for Connected, Ringing, and Reconnecting states', () => {
    const states = [
      CallButtonState.Connected,
      CallButtonState.Ringing,
      CallButtonState.Reconnecting,
    ];
    states.forEach((state) => {
      const { unmount } = render(
        <CallButtonGroup
          phoneNumberToCall="0999999999"
          buttonState={state}
          onStartCall={mockOnStartCall}
          onEndCall={mockOnEndCall}
          onToggleDropdown={mockOnToggleDropdown}
          callDuration={state === CallButtonState.Reconnecting ? 1 : 0}
        />
      );
      expect(screen.getByText('text.hangUp')).toBeInTheDocument();
      if (state === CallButtonState.Reconnecting) {
        expect(screen.getByTestId('counter')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
      }
      unmount();
    });
  });

  it('calls onStartCall when call button is clicked', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) => btn.textContent?.includes('Call'));
    callButton?.click();

    expect(mockOnStartCall).toHaveBeenCalledTimes(1);
  });

  it('calls onEndCall when hang up button is clicked', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.InCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const hangUpButton = screen.getByText('text.hangUp').closest('button');
    hangUpButton?.click();

    expect(mockOnEndCall).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleDropdown when dropdown button is clicked', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="arrow-dropdown-icon"]')
    );
    dropdownButton?.click();

    expect(mockOnToggleDropdown).toHaveBeenCalledTimes(1);
  });

  it('disables dropdown button when connecting', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="arrow-dropdown-icon"]')
    );
    expect(dropdownButton).toBeDisabled();
  });

  it('renders "please select" message when phoneNumberToCall is null', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall={null}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByText('text.pleaseSelect')).toBeInTheDocument();
    expect(screen.queryByText('Call')).not.toBeInTheDocument();
  });

  it('renders "please select" message when phoneNumberToCall is undefined', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall={undefined}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByText('text.pleaseSelect')).toBeInTheDocument();
    expect(screen.queryByText('Call')).not.toBeInTheDocument();
  });

  it('disables call button when phoneNumberToCall is null', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall={null}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) =>
      btn.textContent?.includes('text.pleaseSelect')
    );
    expect(callButton).toBeDisabled();
  });

  it('disables call button when phoneNumberToCall is undefined', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall={undefined}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) =>
      btn.textContent?.includes('text.pleaseSelect')
    );
    expect(callButton).toBeDisabled();
  });

  it('renders phone icon when not connecting', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByTestId('phone-outline-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
  });

  it('renders loading spinner when connecting', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    expect(screen.queryByTestId('phone-outline-icon')).not.toBeInTheDocument();
  });

  it('renders hang up button with counter when callDuration is provided', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.InCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
        callDuration={125}
      />
    );

    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    expect(screen.getByTestId('counter')).toBeInTheDocument();
  });

  it('renders hang up button without counter when callDuration is 0', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.InCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
        callDuration={0}
      />
    );

    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
  });

  it('renders hang up button without counter when callDuration is undefined', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.InCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
  });

  it('renders hang up button with PhoneInTalk icon for Connected state', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connected}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByTestId('phone-in-talk-icon')).toBeInTheDocument();
    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
  });

  it('renders hang up button with PhoneInTalk icon for Ringing state', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Ringing}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByTestId('phone-in-talk-icon')).toBeInTheDocument();
    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
  });

  it('renders hang up button with PhoneInTalk icon for Reconnecting state', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Reconnecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
        callDuration={60}
      />
    );

    expect(screen.getByTestId('phone-in-talk-icon')).toBeInTheDocument();
    expect(screen.getByText('text.hangUp')).toBeInTheDocument();
    expect(screen.getByTestId('counter')).toBeInTheDocument();
  });

  it('does not call onStartCall when button is disabled (no phone number)', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall={null}
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) =>
      btn.textContent?.includes('text.pleaseSelect')
    );
    callButton?.click();

    expect(mockOnStartCall).not.toHaveBeenCalled();
  });

  it('does not call onStartCall when button is disabled (connecting)', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const callButton = buttons.find((btn) => btn.textContent?.includes('Call'));
    callButton?.click();

    expect(mockOnStartCall).not.toHaveBeenCalled();
  });

  it('does not call onToggleDropdown when dropdown is disabled (connecting)', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0999999999"
        buttonState={CallButtonState.Connecting}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons.find((btn) =>
      btn.querySelector('[data-testid="arrow-dropdown-icon"]')
    );
    dropdownButton?.click();

    expect(mockOnToggleDropdown).not.toHaveBeenCalled();
  });

  it('renders correct masked phone number format', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall="0812345678"
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    // maskPhoneNumber should mask the last 4 digits
    expect(screen.getByText('081234****')).toBeInTheDocument();
  });

  it('renders empty string phone number correctly', () => {
    render(
      <CallButtonGroup
        phoneNumberToCall=""
        buttonState={CallButtonState.ReadyToCall}
        onStartCall={mockOnStartCall}
        onEndCall={mockOnEndCall}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByText('text.pleaseSelect')).toBeInTheDocument();
  });
});
