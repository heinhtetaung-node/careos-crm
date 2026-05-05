import React from 'react';

import { contractHistoryHandlerNolinkException } from '__mocks__/handlers/contractHistoryHandler';
import { server } from '__mocks__/server';
import { fireEvent, render, screen, waitFor } from '__tests__/rtl-test-utils';

import ContractHistory from '.';

test('renders ContractHistory successfully', async () => {
  render(<ContractHistory id="fakeId" />);

  expect(screen.getByTestId('contract-history-table')).toBeTruthy();
  expect(
    screen.getByTestId('contract-history-table-headers-row').children.length
  ).toBe(5);
  expect(screen.getByTestId('contract-history-table-id')).toBeTruthy();
  expect(screen.getByTestId('contract-history-table-createTime')).toBeTruthy();
  expect(
    screen.getByTestId('contract-history-table-contractLink')
  ).toBeTruthy();
  expect(screen.getByTestId('contract-history-table-expireTime')).toBeTruthy();
  expect(screen.getByTestId('contract-history-table-copy')).toBeTruthy();
});

test.skip('ContractHistory table should show mock datas successfully', async () => {
  render(<ContractHistory id="fakeId" />);

  await waitFor(() => {
    expect(
      screen.getByTestId('contract-history-table-body-row').children.length
    ).toBe(10);
  });
});

test.skip('ContractHistory table should not show link if there is no link in data', async () => {
  render(<ContractHistory id="fakeId" />);
  server.use(contractHistoryHandlerNolinkException);
  await waitFor(() => {
    expect(
      screen.getByTestId('contract-history-table-body-row').children.length
    ).toBe(10);
    const firstRow = screen.getByTestId('contract-history-table-body-row')
      .children[0];
    const firstColumn = firstRow.getElementsByClassName('no-link');
    expect(firstColumn[0]).toHaveTextContent('-');
  });
});

test.skip('ContractHistory table pagination showing correctly and working', async () => {
  render(<ContractHistory id="fakeId" />);
  await waitFor(() => {
    expect(
      screen.getByTestId('contract-history-table-body-row').children.length
    ).toBe(10);
    expect(
      screen.getByTestId('contract-history-table-pagination')
    ).toBeInTheDocument();
  });
  // still error
  fireEvent.click(screen.getByTestId('pagination-next-page-btn'));
  await waitFor(() => {
    expect(
      screen.getByTestId('contract-history-table-body-row').children.length
    ).toBe(10);
  });
  fireEvent.change(screen.getByTestId('select-pageSizeSelect'), {
    target: { value: '20' },
  });
  await waitFor(() => {
    expect(
      screen.getByTestId('contract-history-table-body-row').children.length
    ).toBe(20);
  });
});
