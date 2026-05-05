import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneNumberItem from './PhoneNumberItem';

describe('PhoneNumberItem', () => {
  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders phone number with masked format', () => {
    render(
      <PhoneNumberItem
        phone="0999999999"
        status="verified"
        phoneIndex={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/099999\*\*\*\*/)).toBeInTheDocument();
  });

  it('calls onSelect when radio button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PhoneNumberItem
        phone="0999999999"
        status="verified"
        phoneIndex={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const radioButton = screen.getByRole('radio');
    await user.click(radioButton);

    expect(mockOnSelect).toHaveBeenCalledWith('0999999999', 0);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PhoneNumberItem
        phone="0999999999"
        status="verified"
        phoneIndex={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('0999999999', 0);
  });
});
