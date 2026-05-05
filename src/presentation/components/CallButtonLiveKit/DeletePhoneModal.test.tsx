import React from 'react';
import { render } from '@testing-library/react';
import DeletePhoneModal from './DeletePhoneModal';

// Mock dependencies
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('../modal/CommonModal', () => ({
  __esModule: true,
  default: function MockCommonModal({
    open,
    handleCloseModal,
    children,
    title,
    dataTestId,
  }: {
    open: boolean;
    handleCloseModal: () => void;
    children: React.ReactNode;
    title: string;
    dataTestId?: string;
  }) {
    if (!open) return null;
    return (
      <div data-testid={dataTestId || 'common-modal'}>
        <div data-testid="modal-title">{title}</div>
        {children}
        <button type="button" onClick={handleCloseModal}>
          Close Modal
        </button>
      </div>
    );
  },
}));

jest.mock('@alphafounders/ui', () => ({
  Button: ({
    text,
    onClick,
    disabled,
    isLoading,
    dataTestId,
    variant,
    className,
  }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid={dataTestId}
      data-variant={variant}
      className={className}
    >
      {isLoading ? 'Loading...' : text}
    </button>
  ),
}));

describe('DeletePhoneModal', () => {
  const mockPhoneToDelete = {
    phone: '+1234567890',
    phoneIndex: 0,
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    phoneToDelete: mockPhoneToDelete,
    isRemovingPhone: false,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeletePhoneModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });
});
