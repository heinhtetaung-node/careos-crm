import React from 'react';

import { paymentHistoryHandlerNolinkException } from '__mocks__/handlers/paymentHistoryHandler';
import { server } from '__mocks__/server';
import { fireEvent, render, screen, waitFor } from '__tests__/rtl-test-utils';

import PaymentHistory from '.';

test('renders PaymentHistory successfully', async () => {
  render(<PaymentHistory id="fakeId" />);

  expect(screen.getByTestId('payment-history-table')).toBeTruthy();
  expect(
    screen.getByTestId('payment-history-table-headers-row').children.length
  ).toBe(6);
  expect(screen.getByTestId('payment-history-table-id')).toBeTruthy();
  expect(screen.getByTestId('payment-history-table-createTime')).toBeTruthy();
  expect(screen.getByTestId('payment-history-table-paymentLink')).toBeTruthy();
  expect(screen.getByTestId('payment-history-table-expiryTime')).toBeTruthy();
  expect(screen.getByTestId('payment-history-table-copy')).toBeTruthy();
  expect(screen.getByTestId('payment-history-table-status')).toBeTruthy();
});

test('PaymentHistory table should show mock datas successfully', async () => {
  render(<PaymentHistory id="fakeId" />);

  await waitFor(() => {
    expect(
      screen.getByTestId('payment-history-table-body-row').children.length
    ).toBe(10);
  });
});

test('PaymentHistory table should not show link if there is no link in data', async () => {
  render(<PaymentHistory id="fakeId" />);
  server.use(paymentHistoryHandlerNolinkException);
  await waitFor(() => {
    expect(
      screen.getByTestId('payment-history-table-body-row').children.length
    ).toBe(10);
    const firstRow = screen.getByTestId('payment-history-table-body-row')
      .children[0];
    const firstColumn = firstRow.getElementsByClassName('no-link');
    expect(firstColumn[0]).toHaveTextContent('-');
  });
});

test('PaymentHistory table pagination showing correctly and working', async () => {
  render(<PaymentHistory id="fakeId" />);
  await waitFor(() => {
    expect(
      screen.getByTestId('payment-history-table-body-row').children.length
    ).toBe(10);
    expect(
      screen.getByTestId('payment-history-table-pagination')
    ).toBeInTheDocument();
  });
  // still error
  fireEvent.click(screen.getByTestId('pagination-next-page-btn'));
  await waitFor(() => {
    expect(
      screen.getByTestId('payment-history-table-body-row').children.length
    ).toBe(10);
  });
  fireEvent.change(screen.getByTestId('select-pageSizeSelect'), {
    target: { value: '20' },
  });
  await waitFor(() => {
    expect(
      screen.getByTestId('payment-history-table-body-row').children.length
    ).toBe(10);
  });
});
