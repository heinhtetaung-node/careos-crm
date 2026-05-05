import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import FormikInputDateMask from './FormikInputDateMask';

it('Render FormikInputDateMask', () => {
  const config = {
    name: 'dob',
    title: 'text.dob',
    value: '12/12',
    inputId: 'test-input',
    options: {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y'],
    },
    onBlur: jest.fn(),
    setValue: jest.fn(),
  };
  render(<FormikInputDateMask {...config} />);
  const textbox = screen.getByRole('textbox');
  expect(textbox).toBeTruthy();
  expect(textbox).toHaveValue('12/12/');
});

it('FormikInputDateMask handle change', async () => {
  const config = {
    name: 'dob',
    title: 'text.dob',
    inputId: 'test-input',
    options: {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y'],
    },
    onBlur: jest.fn(),
    setValue: jest.fn(),
  };
  render(<FormikInputDateMask {...config} />);
  const textbox = screen.getByRole('textbox');
  userEvent.clear(textbox);
  userEvent.tab();
  await waitFor(() => {
    expect(textbox).toHaveValue('');
  });
});

it('FormikInputDateMask handle change when isThai true', async () => {
  const mockedSetValue = jest.fn();
  const config = {
    name: 'dob',
    title: 'text.dob',
    inputId: 'test-input',
    options: {
      date: true,
      delimiter: '/',
      datePattern: ['d', 'm', 'Y'],
    },
    onBlur: jest.fn(),
    setValue: mockedSetValue,
    isThai: true,
  };

  render(<FormikInputDateMask {...config} />);

  const textbox = screen.getByRole('textbox');

  userEvent.clear(textbox);
  userEvent.type(textbox, '12/12/2021{enter}');

  await waitFor(() => {
    expect(mockedSetValue).toHaveBeenCalledWith('12/12/2544');
  });
});
