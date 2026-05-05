import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import MockForm from './MockForm';

const handleSubmit = jest.fn();
const setDialogProps = jest.fn();

test('Should render MockForm', () => {
  render(<MockForm formId="test-mockform" onSubmit={handleSubmit} />);
  expect(screen.getByTestId('default-mockform')).toBeTruthy();
});

test('Should selected item', async () => {
  render(<MockForm formId="test-mockform" onSubmit={handleSubmit} />);

  const buttons = await screen.getAllByRole('button');
  expect(buttons[0]).toBeTruthy();
  await userEvent.click(buttons[0]);

  const options = await screen.getAllByRole('option');
  expect(options[0]).toBeTruthy();
  await userEvent.click(options[0]);

  expect(options[0]).toHaveAttribute('aria-selected', 'true');
});

test('Should textfield change', async () => {
  render(<MockForm formId="test-mockform" onSubmit={handleSubmit} />);

  const textfields = await screen.findAllByRole('textbox');
  const commentBox = textfields[2] as HTMLInputElement;
  expect(commentBox).toBeTruthy();
  expect(commentBox).toHaveAttribute('aria-invalid', 'false');
  await userEvent.type(commentBox, 'New comment');

  expect(commentBox.value).toBe('New comment');
});

test('Should setDialogProps function to be called', async () => {
  render(
    <MockForm
      formId="test-mockform"
      onSubmit={handleSubmit}
      setDialogProps={setDialogProps}
    />
  );

  const radios = await screen.getAllByRole('radio');
  expect(radios.length).toBe(2);
  await userEvent.click(radios[0]);

  expect(setDialogProps).toHaveBeenCalled();
});
