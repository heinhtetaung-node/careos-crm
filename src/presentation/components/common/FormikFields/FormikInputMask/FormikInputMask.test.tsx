import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import FormikInputMask from './index';

it('Render FormikInputMask', () => {
  const config = {
    name: 'phone',
    title: 'text.phone',
    value: '121298',
    options: {
      blocks: [2, 1, 1, 6],
      delimiter: '-',
    },
    inputId: 'test-input',
    onBlur: jest.fn(),
    setValue: jest.fn(),
  };
  render(<FormikInputMask {...config} />);
  const textbox = screen.getByRole('textbox');
  expect(textbox).toBeTruthy();
  expect(textbox).toHaveValue('12-1-2-98');
});

it('Render FormikInputMask handle change', async () => {
  const config = {
    name: 'phone',
    title: 'text.phone',
    value: '121298',
    options: {
      blocks: [2, 1, 1, 6],
      delimiter: '-',
    },
    inputId: 'test-input',
    onBlur: jest.fn(),
    setValue: jest.fn(),
  };
  render(<FormikInputMask {...config} />);
  const textbox = screen.getByRole('textbox');
  userEvent.clear(textbox);
  userEvent.tab();

  await waitFor(() => {
    expect(textbox).toHaveValue('');
  });
});
