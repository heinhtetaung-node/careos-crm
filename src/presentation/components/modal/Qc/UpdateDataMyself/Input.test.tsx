import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import Input from './Input';

const noopSetIsDateInputEmpty = jest.fn();

test('renders radio field with label, options, and calls handleOnChange when selection changes', async () => {
  const handleOnChange = jest.fn();

  render(
    <Input
      fieldType="radio"
      label="qc.deliveryOptions"
      value="digital"
      options={[
        { value: 'digital', label: 'Digital' },
        { value: 'physical', label: 'Physical' },
      ]}
      handleOnChange={handleOnChange}
      setIsDateInputEmpty={noopSetIsDateInputEmpty}
    />
  );

  expect(screen.getByText('qc.deliveryOptions')).toBeInTheDocument();

  const radios = screen.getAllByRole('radio');
  expect(radios).toHaveLength(2);
  expect(radios[0]).toBeChecked();

  await userEvent.click(radios[1]);
  expect(handleOnChange).toHaveBeenCalledWith('physical');
});

test('renders disabled radio group when disabled is true', () => {
  render(
    <Input
      fieldType="radio"
      label="qc.deliveryOptions"
      value="digital"
      options={[{ value: 'digital', label: 'Digital' }]}
      disabled
      handleOnChange={jest.fn()}
      setIsDateInputEmpty={noopSetIsDateInputEmpty}
    />
  );

  expect(screen.getByRole('radio')).toBeDisabled();
});

test('should render the correct dob picker', async () => {
  const handleOnChange = jest.fn();
  render(
    <Input
      options={[]}
      handleOnChange={handleOnChange}
      value="2000-01-01"
      fieldType="dobPicker"
      label="Dob Picker"
      setIsDateInputEmpty={noopSetIsDateInputEmpty}
    />
  );

  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText(/2002/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '2002' }));
  await userEvent.click(screen.getByText(/Feb/i));
  await userEvent.click(screen.getByText('11'));
  expect(handleOnChange).toHaveBeenCalled();
  expect(
    screen.getByPlaceholderText('text.enterAppointmentDate')
  ).toBeInTheDocument();
});
