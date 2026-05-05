import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorFallback from './index';

// Mock react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ title }: { title: string }) => (
    <div data-testid="helmet" data-title={title} />
  ),
}));

// Mock Button component
jest.mock('@alphafounders/ui', () => ({
  Button: ({
    onClick,
    text,
    className,
    variant,
  }: {
    onClick: () => void;
    text: string;
    className?: string;
    variant?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-testid={`button-${text.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {text}
    </button>
  ),
}));

// Define __APP_VERSION__ on globalThis for testing
Object.defineProperty(globalThis, '__APP_VERSION__', {
  value: '1.0.0-test',
  writable: true,
  configurable: true,
});

describe('ErrorFallback', () => {
  const mockResetErrorBoundary = jest.fn();
  const mockError = new Error('Test error');

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set default app version
    Object.defineProperty(globalThis, '__APP_VERSION__', {
      value: '1.0.0-test',
      writable: true,
      configurable: true,
    });
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders the error message and title', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please refresh the page or contact support if the issue persists.'
      )
    ).toBeInTheDocument();
  });

  it('renders the correct Helmet title', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const helmet = screen.getByTestId('helmet');
    expect(helmet).toHaveAttribute('data-title', 'Something went wrong');
  });

  it('renders both action buttons', () => {
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByTestId('button-try-again')).toBeInTheDocument();
    expect(screen.getByTestId('button-go-home')).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when "Try again" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const tryAgainButton = screen.getByTestId('button-try-again');
    await user.click(tryAgainButton);

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('navigates to home when "Go Home" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    const goHomeButton = screen.getByTestId('button-go-home');
    await user.click(goHomeButton);

    expect(window.location.href).toBe('/');
  });

  it('displays trace information when appVersion is available', () => {
    Object.defineProperty(globalThis, '__APP_VERSION__', {
      value: '2.0.0',
      writable: true,
      configurable: true,
    });
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.getByText('Trace Information:')).toBeInTheDocument();
    expect(screen.getByText('Client Version: 2.0.0')).toBeInTheDocument();
  });

  it('displays trace information when nrSessionID is available', async () => {
    const sessionID = 'test-session-123';
    localStorage.setItem('NRBA_SESSION', JSON.stringify({ value: sessionID }));

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Trace Information:')).toBeInTheDocument();
      expect(
        screen.getByText(`New Relic Session ID: ${sessionID}`)
      ).toBeInTheDocument();
    });
  });

  it('displays both appVersion and nrSessionID when both are available', async () => {
    Object.defineProperty(globalThis, '__APP_VERSION__', {
      value: '3.0.0',
      writable: true,
      configurable: true,
    });
    const sessionID = 'test-session-456';
    localStorage.setItem('NRBA_SESSION', JSON.stringify({ value: sessionID }));

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Client Version: 3.0.0')).toBeInTheDocument();
      expect(
        screen.getByText(`New Relic Session ID: ${sessionID}`)
      ).toBeInTheDocument();
    });
  });

  it('does not display trace information when neither appVersion nor nrSessionID are available', () => {
    Object.defineProperty(globalThis, '__APP_VERSION__', {
      value: '',
      writable: true,
      configurable: true,
    });
    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    expect(screen.queryByText('Trace Information:')).not.toBeInTheDocument();
  });

  it('handles missing NRBA_SESSION in localStorage gracefully', async () => {
    localStorage.removeItem('NRBA_SESSION');

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('New Relic Session ID:')
      ).not.toBeInTheDocument();
    });
  });

  it('handles invalid JSON in NRBA_SESSION gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorage.setItem('NRBA_SESSION', 'invalid-json');

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to parse NRBA_SESSION from localStorage'
      );
      expect(
        screen.queryByText('New Relic Session ID:')
      ).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles NRBA_SESSION with null value gracefully', async () => {
    localStorage.setItem('NRBA_SESSION', JSON.stringify({ value: null }));

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('New Relic Session ID:')
      ).not.toBeInTheDocument();
    });
  });

  it('handles NRBA_SESSION with missing value property gracefully', async () => {
    localStorage.setItem('NRBA_SESSION', JSON.stringify({}));

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('New Relic Session ID:')
      ).not.toBeInTheDocument();
    });
  });

  it('handles NRBA_SESSION with non-string value gracefully', async () => {
    localStorage.setItem('NRBA_SESSION', JSON.stringify({ value: 12345 }));

    render(
      <ErrorFallback
        error={mockError}
        resetErrorBoundary={mockResetErrorBoundary}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('New Relic Session ID:')
      ).not.toBeInTheDocument();
    });
  });
});
