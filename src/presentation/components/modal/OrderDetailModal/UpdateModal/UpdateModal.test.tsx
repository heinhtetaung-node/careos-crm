import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import OrderUpdateModal from './index';

test('render OrderUpdateModal view successfully', async () => {
  const { getByTestId } = render(<OrderUpdateModal close={() => null} />);
  expect(getByTestId('order-update-modal')).toBeTruthy();

  await userEvent.click(screen.getByText(/orderUpdateFrm.pending/i));
  expect(screen.getByLabelText(/orderUpdateFrm.pending/i)).toBeChecked();
  await userEvent.type(
    screen.getByPlaceholderText('orderUpdateFrm.commentPlaceholder'),
    'hello'
  );

  const updateButton = screen.getByTestId('document-status-update-button');
  await waitFor(() => expect(updateButton).not.toBeDisabled());

  await userEvent.click(updateButton);
});

const Warning = (
  <ul>
    <li>Policyholder Info: Title</li>
    <li>Policyholder Info: DOB</li>
    <li>Vehicle: 2nd driver DOB</li>
    <li>Documents: 1st Named Driver License</li>
  </ul>
);

test('render OrderUpdateModal if there is a warning view successfully', () => {
  const { getByTestId } = render(
    <OrderUpdateModal close={() => null} warning={Warning} />
  );
  expect(getByTestId('order-update-modal__warning')).toBeTruthy();
});

test('render OrderUpdateModal if there is no warning view successfully', () => {
  const { queryByTestId } = render(<OrderUpdateModal close={() => null} />);
  expect(queryByTestId('order-update-modal__warning')).toBeFalsy();
});
