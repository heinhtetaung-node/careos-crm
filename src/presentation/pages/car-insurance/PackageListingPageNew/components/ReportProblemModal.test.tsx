import React from 'react';
import { fireEvent, render, screen, waitFor } from '__tests__/rtl-test-utils';
import ReportProblemModal from './ReportProblemModal';

const mockNavigate = jest.fn();
const mockAddComment = jest.fn();
const mockOnClose = jest.fn();
var mockShowSuccessSnackbar: jest.Mock;
var mockShowErrorSnackbar: jest.Mock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('data/slices/leadDetails/commentsSlice', () => ({
  useAddCommentMutation: () => [mockAddComment],
}));

jest.mock('utils/snackbar', () => {
  mockShowSuccessSnackbar = jest.fn();
  mockShowErrorSnackbar = jest.fn();
  return jest.fn(() => ({
    showSuccessSnackbar: mockShowSuccessSnackbar,
    showErrorSnackbar: mockShowErrorSnackbar,
  }));
});

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string) => key),
}));

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  leadId: '123',
};

const renderComponent = (props = defaultProps) =>
  render(<ReportProblemModal {...props} />);

describe('ReportProblemModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: jest.fn().mockResolvedValue('clipboard content'),
      },
      configurable: true,
    });
  });

  it('renders when open', () => {
    renderComponent();
    expect(screen.getByText('text.cancelButton')).toBeInTheDocument();
    expect(screen.getByText('submissionStatus.submit')).toBeInTheDocument();
    expect(screen.getByText('text.submitAndCreate')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderComponent({ ...defaultProps, isOpen: false });
    expect(screen.queryByText('submissionStatus.submit')).not.toBeInTheDocument();
  });

  it('reads clipboard content when modal opens', async () => {
    renderComponent();
    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });
  });

  it('falls back gracefully when clipboard read fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: jest.fn().mockRejectedValue(new Error('Permission denied')),
      },
      configurable: true,
    });
    renderComponent();
    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('text.cancelButton'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Submit is clicked and comment is added successfully', async () => {
    mockAddComment.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    renderComponent();

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('submissionStatus.submit');
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith({
        text: expect.any(String),
        leadId: 'leads/123',
      });
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to custom-quote on Submit & Create when comment is added successfully', async () => {
    mockAddComment.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    renderComponent();

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    const submitCreateButton = screen.getByText('text.submitAndCreate');
    expect(submitCreateButton).not.toBeDisabled();

    fireEvent.click(submitCreateButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/leads/123/custom-quote',
        expect.objectContaining({ state: expect.any(Object) })
      );
    });
  });

  it('shows error snackbar when comment submission fails', async () => {
    mockAddComment.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error('Network error')),
    });
    renderComponent();

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('submissionStatus.submit'));

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalled();
    });
  });
});
