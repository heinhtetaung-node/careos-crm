import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpdateRefundStatusButton } from './UpdateRefundStatusButton';
import * as cancellationSlice from 'data/slices/cancellationSlice';
import useSnackbar from 'utils/snackbar';
import { RefundStatusOptions } from './helper';

// Mock the dependencies
jest.mock('data/slices/cancellationSlice');
jest.mock('utils/snackbar');
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn().mockImplementation((key) => key),
}));

describe('UpdateRefundStatusButton', () => {
  const mockRowData = {
    id: 'REF001',
    name: 'refund-123',
  };

  const mockUpdateRefundStatus = jest.fn();
  const mockShowSuccessSnackbar = jest.fn();
  const mockShowErrorSnackbar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (
      cancellationSlice.useUpdateRefundStatusMutation as jest.Mock
    ).mockReturnValue([mockUpdateRefundStatus]);
    (useSnackbar as jest.Mock).mockReturnValue({
      showSuccessSnackbar: mockShowSuccessSnackbar,
      showErrorSnackbar: mockShowErrorSnackbar,
    });
    mockUpdateRefundStatus.mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue({}),
    }));
  });

  test('renders edit button correctly', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    expect(editButton).toBeInTheDocument();
  });

  test('opens modal when edit button is clicked', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');

    fireEvent.click(editButton);

    expect(screen.getByText('REF001')).toBeInTheDocument();
    expect(screen.getByTestId('select-status')).toBeInTheDocument();
  });

  test('update button should be disabled when no status is selected', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const updateButton = screen.getByText('text.update');
    expect(updateButton).toBeDisabled();
  });

  test('enables update button when status is selected', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const selectElement = screen.getByTestId('select-status');
    fireEvent.change(selectElement, { target: { value: '1' } });

    const updateButton = screen.getByText('text.update');
    expect(updateButton).not.toBeDisabled();
  });

  test('updates refund status successfully', async () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const selectElement = screen.getByTestId('select-status');
    fireEvent.change(selectElement, { target: { value: '1' } });

    const updateButton = screen.getByText('text.update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateRefundStatus).toHaveBeenCalledWith({
        id: 'refund-123',
        status: RefundStatusOptions.find((option) => option.id === 1)?.value,
      });
      expect(mockShowSuccessSnackbar).toHaveBeenCalled();
    });
  });

  test('shows error snackbar when update fails', async () => {
    const errorMessage = 'Update failed';
    mockUpdateRefundStatus.mockImplementation(() => ({
      unwrap: jest.fn().mockRejectedValue({ data: { message: errorMessage } }),
    }));

    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const selectElement = screen.getByTestId('select-status');
    fireEvent.change(selectElement, { target: { value: '1' } });

    const updateButton = screen.getByText('text.update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalled();
    });
  });

  test('closes modal when close button is clicked', async () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    // Verify modal is open first
    expect(screen.getByText('REF001')).toBeVisible();

    const closeButton = screen.getByText('text.close');
    fireEvent.click(closeButton);

    // Wait for modal to close and check if it's no longer visible
    await waitFor(() => {
      expect(screen.queryByText('REF001')).not.toBeVisible();
    });
  });

  test('resets selected status when modal is opened', async () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');

    // First open and select a status
    fireEvent.click(editButton);
    const selectElement = screen.getByTestId('select-status');
    fireEvent.change(selectElement, { target: { value: '1' } });

    // Close the modal
    const closeButton = screen.getByText('text.close');
    fireEvent.click(closeButton);

    // Open modal again
    fireEvent.click(editButton);

    // Update button should be disabled again
    const updateButton = screen.getByText('text.update');
    expect(updateButton).toBeDisabled();
  });

  test('applies correct classes to edit button', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');

    expect(editButton).toHaveClass('cursor-pointer');
    expect(editButton).toHaveClass('bg-primary');
    expect(editButton).toHaveClass('rounded-full');
  });

  test('modal title displays correct refund ID', () => {
    const customRowData = {
      id: 'CUSTOM-REF-123',
      name: 'refund-456',
    };

    render(<UpdateRefundStatusButton rowData={customRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    expect(screen.getByText('CUSTOM-REF-123')).toBeInTheDocument();
  });

  test('handles multiple status selections', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const selectElement = screen.getByTestId('select-status');

    // First selection
    fireEvent.change(selectElement, { target: { value: '1' } });
    let updateButton = screen.getByText('text.update');
    expect(updateButton).not.toBeDisabled();

    // Change selection
    fireEvent.change(selectElement, { target: { value: '2' } });
    updateButton = screen.getByText('text.update');
    expect(updateButton).not.toBeDisabled();

    // Verify that the correct status gets sent when clicked
    fireEvent.click(updateButton);

    expect(mockUpdateRefundStatus).toHaveBeenCalledWith({
      id: 'refund-123',
      status: RefundStatusOptions.find((option) => option.id === 2)?.value,
    });
  });

  test('preserves state when modal remains open', () => {
    render(<UpdateRefundStatusButton rowData={mockRowData} />);
    const editButton = screen.getByLabelText('open document');
    fireEvent.click(editButton);

    const selectElement = screen.getByTestId('select-status');
    fireEvent.change(selectElement, { target: { value: '1' } });

    // Verify the selection is preserved
    expect(selectElement).toHaveValue('1');

    // Click something else (modal content) without closing the modal
    const modalTitle = screen.getByText('REF001');
    fireEvent.click(modalTitle);

    // Selection should still be there
    expect(selectElement).toHaveValue('1');
  });
});
