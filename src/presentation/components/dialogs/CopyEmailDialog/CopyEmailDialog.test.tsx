import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useCopyToClipboard } from 'usehooks-ts';

import { showSnackBar } from 'presentation/redux/actions/ui';

import CopyEmailDialog from './CopyEmailDialog';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('usehooks-ts', () => ({
  useCopyToClipboard: jest.fn(),
}));

jest.mock('presentation/redux/actions/ui', () => ({
  showSnackBar: jest.fn(),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string) => {
    const strings: Record<string, string> = {
      'copyEmailDialog.title': 'Insurer Notification Content',
      'copyEmailDialog.copyEmailAddress': 'Copy Email Address',
      'copyEmailDialog.copySubject': 'Copy Subject',
      'copyEmailDialog.copyBody': 'Copy Body',
      'copyEmailDialog.openInApp': 'Open in Gmail',
      'copyEmailDialog.copyEmailSuccess': 'Insurer email address copied!',
      'copyEmailDialog.copySubjectSuccess': 'Email subject copied!',
      'copyEmailDialog.copyBodySuccess': 'Email body copied!',
      'text.loadingContent': 'Loading email content...',
      'text.failedToLoadContent': 'Failed to load content',
      'text.emailTo': 'Email To',
      'text.subject': 'Subject',
      'text.emailBody': 'Email Body',
    };
    return strings[key] || key;
  }),
}));

jest.mock('shared/constants', () => ({
  snackBarConfig: {
    type: {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    },
  },
}));

// Mock UI components
function MockButton({ text, onClick, variant, ...props }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`button-${variant}-${text?.toLowerCase()?.replace(/\s+/g, '-')}`}
      {...props}
    >
      {text}
    </button>
  );
}

jest.mock('@alphafounders/ui', () => ({
  Button: MockButton,
}));

function MockDialog({ open, children, content, handleToggle, ...props }: any) {
  if (!open) return null;
  return (
    <div data-testid="dialog" {...props}>
      <div data-testid="dialog-content">{content ?? children}</div>
      <button onClick={handleToggle} data-testid="dialog-close" type="button">
        Close
      </button>
    </div>
  );
}

jest.mock('presentation/components/common/Dialog', () => ({
  __esModule: true,
  default: MockDialog,
}));

function MockEmailIcon() {
  return <div data-testid="email-icon">📧</div>;
}

jest.mock('presentation/components/icons', () => ({
  EmailIcon: MockEmailIcon,
}));

function MockSpinner() {
  return <div data-testid="spinner">Loading...</div>;
}

jest.mock('presentation/components/Spinner', () => ({
  __esModule: true,
  default: MockSpinner,
}));

// Import mocked modules for typing

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseCopyToClipboard = useCopyToClipboard as jest.MockedFunction<
  typeof useCopyToClipboard
>;
const mockShowSnackBar = showSnackBar as jest.MockedFunction<
  typeof showSnackBar
>;

describe('CopyEmailDialog', () => {
  const mockDispatch = jest.fn();
  const mockCopy = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    isLoading: false,
    data: {
      emailAddress: 'test@example.com',
      emailCcs: ['cc@example.com'],
      emailSubject: 'Test Subject',
      emailBody: 'Test email body content',
    },
    isError: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseCopyToClipboard.mockReturnValue([null, mockCopy]);
    mockShowSnackBar.mockImplementation((args: any) => args);
  });

  describe('Component Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<CopyEmailDialog {...defaultProps} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('email-icon')).toBeInTheDocument();
      expect(
        screen.getByText('Insurer Notification Content')
      ).toBeInTheDocument();
    });

    it('does not render dialog when isOpen is false', () => {
      render(<CopyEmailDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders email content sections when data is provided', () => {
      render(<CopyEmailDialog {...defaultProps} />);

      expect(screen.getByText('Email To:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Subject:')).toBeInTheDocument();
      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      expect(screen.getByText('Email Body:')).toBeInTheDocument();
      expect(screen.getByText('Test email body content')).toBeInTheDocument();
    });

    it('renders all action buttons when data is provided', () => {
      render(<CopyEmailDialog {...defaultProps} />);

      expect(
        screen.getByTestId('button-secondary-copy-email-address')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('button-secondary-copy-subject')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('button-secondary-copy-body')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('button-primary-open-in-gmail')
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading state when isLoading is true', () => {
      render(<CopyEmailDialog {...defaultProps} isLoading data={null} />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading email content...')).toBeInTheDocument();
      expect(screen.queryByText('Email To:')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when isError is true and no data', () => {
      render(<CopyEmailDialog {...defaultProps} isError data={null} />);

      expect(screen.getByTestId('email-icon')).toBeInTheDocument();
      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      expect(screen.queryByText('Email To:')).not.toBeInTheDocument();
    });

    it('renders data when isError is true but data exists', () => {
      render(<CopyEmailDialog {...defaultProps} isError />);

      expect(screen.getByText('Email To:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('does not render action buttons when isError is true and no data', () => {
      render(<CopyEmailDialog {...defaultProps} isError data={null} />);

      expect(
        screen.queryByTestId('button-secondary-copy-email-address')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('button-secondary-copy-subject')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('button-secondary-copy-body')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('button-primary-open-in-gmail')
      ).not.toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies email address and shows success message when copy email button is clicked', async () => {
      const user = userEvent.setup();
      render(<CopyEmailDialog {...defaultProps} />);

      const copyEmailButton = screen.getByTestId(
        'button-secondary-copy-email-address'
      );
      await user.click(copyEmailButton);

      expect(mockCopy).toHaveBeenCalledWith('test@example.com');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          message: 'Insurer email address copied!',
          status: 'success',
          isNotClose: false,
        })
      );
    });

    it('copies subject and shows success message when copy subject button is clicked', async () => {
      const user = userEvent.setup();
      render(<CopyEmailDialog {...defaultProps} />);

      const copySubjectButton = screen.getByTestId(
        'button-secondary-copy-subject'
      );
      await user.click(copySubjectButton);

      expect(mockCopy).toHaveBeenCalledWith('Test Subject');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          message: 'Email subject copied!',
          status: 'success',
          isNotClose: false,
        })
      );
    });

    it('copies body and shows success message when copy body button is clicked', async () => {
      const user = userEvent.setup();
      render(<CopyEmailDialog {...defaultProps} />);

      const copyBodyButton = screen.getByTestId('button-secondary-copy-body');
      await user.click(copyBodyButton);

      expect(mockCopy).toHaveBeenCalledWith('Test email body content');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          message: 'Email body copied!',
          status: 'success',
          isNotClose: false,
        })
      );
    });

    it('does not copy when email address is missing', async () => {
      const user = userEvent.setup();
      const propsWithoutEmail = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          emailAddress: '',
        },
      };

      render(<CopyEmailDialog {...propsWithoutEmail} />);

      const copyEmailButton = screen.getByTestId(
        'button-secondary-copy-email-address'
      );
      await user.click(copyEmailButton);

      expect(mockCopy).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not copy when subject is missing', async () => {
      const user = userEvent.setup();
      const propsWithoutSubject = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          emailSubject: '',
        },
      };

      render(<CopyEmailDialog {...propsWithoutSubject} />);

      const copySubjectButton = screen.getByTestId(
        'button-secondary-copy-subject'
      );
      await user.click(copySubjectButton);

      expect(mockCopy).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not copy when body is missing', async () => {
      const user = userEvent.setup();
      const propsWithoutBody = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          emailBody: '',
        },
      };

      render(<CopyEmailDialog {...propsWithoutBody} />);

      const copyBodyButton = screen.getByTestId('button-secondary-copy-body');
      await user.click(copyBodyButton);

      expect(mockCopy).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Gmail Integration', () => {
    it('renders Gmail link with correct URL encoding', () => {
      const propsWithSpecialChars = {
        ...defaultProps,
        data: {
          emailAddress: 'test@example.com',
          emailCcs: ['cc@example.com'],
          emailSubject: 'Test Subject & More',
          emailBody: 'Test email body with special chars: <>&"',
        },
      };

      render(<CopyEmailDialog {...propsWithSpecialChars} />);

      const gmailButton = screen.getByTestId('button-primary-open-in-gmail');
      const gmailLink = gmailButton.closest('a');

      expect(gmailLink).toHaveAttribute(
        'href',
        expect.stringContaining('mail.google.com')
      );
      expect(gmailLink).toHaveAttribute(
        'href',
        expect.stringContaining('to=test%40example.com')
      );
      expect(gmailLink).toHaveAttribute(
        'href',
        expect.stringContaining('su=Test%20Subject%20%26%20More')
      );
      expect(gmailLink).toHaveAttribute('target', '_blank');
      expect(gmailLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles empty values in Gmail URL', () => {
      const propsWithEmptyValues = {
        ...defaultProps,
        data: {
          emailAddress: '',
          emailCcs: [],
          emailSubject: '',
          emailBody: '',
        },
      };

      render(<CopyEmailDialog {...propsWithEmptyValues} />);

      const gmailButton = screen.getByTestId('button-primary-open-in-gmail');
      const gmailLink = gmailButton.closest('a');

      expect(gmailLink).toHaveAttribute(
        'href',
        expect.stringContaining('mail.google.com')
      );
      expect(gmailLink).toHaveAttribute('href', expect.stringContaining('to='));
      expect(gmailLink).toHaveAttribute('href', expect.stringContaining('su='));
      expect(gmailLink).toHaveAttribute(
        'href',
        expect.stringContaining('body=')
      );
    });
  });

  describe('Dialog Close Functionality', () => {
    it('calls onClose when dialog close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(<CopyEmailDialog {...defaultProps} onClose={mockOnClose} />);

      const closeButton = screen.getByTestId('dialog-close');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('renders nothing when data is null and not loading or error', () => {
      render(<CopyEmailDialog {...defaultProps} data={null} />);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.queryByText('Email To:')).not.toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Failed to load content')
      ).not.toBeInTheDocument();
    });

    it('renders with long email content', () => {
      const longContent = 'A'.repeat(100);
      const propsWithLongContent = {
        ...defaultProps,
        data: {
          emailAddress: `long${longContent}@example.com`,
          emailCcs: [`cc${longContent}@example.com`],
          emailSubject: `Long Subject ${longContent}`,
          emailBody: `Long email body ${longContent}`,
        },
      };

      render(<CopyEmailDialog {...propsWithLongContent} />);

      expect(screen.getByText('Email To:')).toBeInTheDocument();
      expect(
        screen.getByText(`long${longContent}@example.com`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Long Subject ${longContent}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Long email body ${longContent}`)
      ).toBeInTheDocument();
    });
  });

  describe('Component Props Validation', () => {
    it('handles all required props', () => {
      const requiredProps = {
        isOpen: true,
        onClose: jest.fn(),
        isLoading: false,
        data: null,
        isError: false,
      };

      expect(() =>
        render(<CopyEmailDialog {...requiredProps} />)
      ).not.toThrow();
    });

    it('handles isOpen false state', () => {
      render(<CopyEmailDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('handles both loading and error states', () => {
      render(
        <CopyEmailDialog {...defaultProps} isLoading isError data={null} />
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(
        screen.queryByText('Failed to load content')
      ).not.toBeInTheDocument();
    });
  });
});
