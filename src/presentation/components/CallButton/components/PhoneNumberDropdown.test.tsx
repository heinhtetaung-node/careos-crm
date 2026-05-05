import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneNumberDropdown from './PhoneNumberDropdown';
import { PhoneNumber } from 'shared/types/customer';

describe('PhoneNumberDropdown', () => {
  const mockPhoneNumbers: PhoneNumber[] = [
    { phone: '0999999999', status: 'verified' },
    { phone: '0888888888', status: 'unverified' },
    { phone: '0777777777', status: 'verified' },
  ];

  const mockOnClose = jest.fn();
  const mockOnPhoneSelect = jest.fn();
  const mockOnPhoneDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PhoneNumberDropdown
        phoneNumbers={mockPhoneNumbers}
        selectedPhoneIndex={0}
        isOpen={false}
        onClose={mockOnClose}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders dropdown when isOpen is true', () => {
    render(
      <PhoneNumberDropdown
        phoneNumbers={mockPhoneNumbers}
        selectedPhoneIndex={0}
        isOpen
        onClose={mockOnClose}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    expect(screen.getByText(/099999\*\*\*\*/)).toBeInTheDocument();
    expect(screen.getByText(/088888\*\*\*\*/)).toBeInTheDocument();
    expect(screen.getByText(/077777\*\*\*\*/)).toBeInTheDocument();
  });

  it('marks selected phone number as checked', () => {
    render(
      <PhoneNumberDropdown
        phoneNumbers={mockPhoneNumbers}
        selectedPhoneIndex={1}
        isOpen
        onClose={mockOnClose}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();
  });

  it('renders delete buttons when onPhoneDelete is provided', () => {
    render(
      <PhoneNumberDropdown
        phoneNumbers={mockPhoneNumbers}
        selectedPhoneIndex={0}
        isOpen
        onClose={mockOnClose}
        onPhoneSelect={mockOnPhoneSelect}
        onPhoneDelete={mockOnPhoneDelete}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('does not render delete buttons when onPhoneDelete is not provided', () => {
    render(
      <PhoneNumberDropdown
        phoneNumbers={mockPhoneNumbers}
        selectedPhoneIndex={0}
        isOpen
        onClose={mockOnClose}
        onPhoneSelect={mockOnPhoneSelect}
      />
    );

    const deleteButtons = screen.queryAllByRole('button');
    expect(deleteButtons.length).toBe(0);
  });
});
