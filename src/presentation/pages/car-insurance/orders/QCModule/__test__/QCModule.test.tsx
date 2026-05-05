import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  within,
  waitForElementToBeRemoved,
  waitFor,
} from '__tests__/rtl-test-utils';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import { MockUsersData } from 'mock-data/UserData.mock';

import QCModulePage from '..';

var mockHandleReset: jest.Mock;

jest.mock('data/slices/authSlice/index', () => ({
  ...jest.requireActual('data/slices/authSlice/index'),
  useGetAuthenticateQuery: jest.fn().mockReturnValue({
    data: {
      name: 'users/uuid',
      role: 'roles/admin',
    },
    isSuccess: true,
    isLoading: false,
  }),
}));

jest.mock('presentation/pages/car-insurance/orders/table.helper', () => {
  mockHandleReset = jest.fn();
  return {
    __esModule: true,
    ...jest.requireActual(
      'presentation/pages/car-insurance/orders/table.helper'
    ),
    handleReset: mockHandleReset,
  };
});

beforeEach(() => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
      () => HttpResponse.json(MockOrderDocuments)
    ),
    http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
      HttpResponse.json(MockUsersData)
    ),
    http.post(
      `${process.env.VITE_GATEWAY_ENDPOINT}/api/orders/:orderType/assign`,
      () =>
        HttpResponse.json({
          name: 'orders/dee8b8b6-9bd7-452a-a230-ec6ca265d761/items/4670e30a-6935-46f2-8865-c264951c4742',
          success: true,
          status: 200,
        })
    )
  );
});

test('render order QC Module list view successfully', () => {
  render(<QCModulePage />);

  expect(screen.getByTestId('order-qc-module-page')).toHaveTextContent(
    'leadDetailFields.orderId'
  );
});

test.skip('filter panel called reset handler different filter depends on roles', async () => {
  render(<QCModulePage />);

  const selects = screen.getAllByPlaceholderText('text.select');
  await userEvent.click(selects[0]);

  await userEvent.click(screen.getByText('text.complete'));

  const resetBtn = screen.getByRole('button', { name: 'text.reset' });

  await userEvent.click(resetBtn);

  expect(mockHandleReset).toHaveBeenCalledWith(
    expect.objectContaining({
      filters: ['order.qcBy="users/uuid"'],
    })
  );
});

it('Should clear cancelled orders checkbox on reset', async () => {
  render(<QCModulePage />);
  const showCancelledCheckbox = screen.getByTestId('show-cancelled-orders');
  expect(showCancelledCheckbox).toBeInTheDocument();

  await userEvent.click(showCancelledCheckbox);
  expect(showCancelledCheckbox.className).toMatch(/Mui-checked/);

  const search = screen.getByPlaceholderText('text.search');
  await userEvent.type(search, 'Policy holder name');

  const comboBox = within(
    screen.getByTestId('muiSelect-selectValue')
  ).getByRole('button');

  await userEvent.click(comboBox);

  const dropdown = screen.getByRole('listbox');
  await userEvent.click(
    within(dropdown).getByRole('option', {
      name: 'searchFieldPrintingAndShippingOption.policyHolderName',
    })
  );

  // Reset button should also clear the show cancelled orders checkbox
  const resetBtn = screen.getByRole('button', { name: 'text.reset' });
  expect(resetBtn).toBeEnabled();
  await userEvent.click(resetBtn);
  expect(mockHandleReset).toHaveBeenCalled();
  expect(showCancelledCheckbox.className).not.toMatch(/Mui-checked/);
});

describe.skip('Test update cache after agent assignment', () => {
  test('should update cache at order level after agent assignment', async () => {
    render(<QCModulePage />);
    const checkboxContainer = await screen.findByTestId('O57083-checkbox');
    const checkbox = within(checkboxContainer).getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    await userEvent.click(checkbox);

    // select agent
    const agentContainer = await screen.findByTestId('muiSelect-agentName');
    const agentMenu = within(agentContainer).getByRole('button');
    await userEvent.click(agentMenu);

    let presentation = await screen.findByRole('presentation');
    const option = await within(presentation).findByText('CypressUpd TestUpd');
    expect(option).toBeInTheDocument();

    await userEvent.click(option);
    await waitForElementToBeRemoved(presentation);

    // assign agent
    const assignBtn = screen.getByTestId('assign-btn');
    expect(assignBtn).not.toBeDisabled();
    await userEvent.click(assignBtn);

    // confirm modal
    presentation = await screen.findByRole('presentation');
    const modalConfirmBtn = within(presentation).getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(modalConfirmBtn);

    await waitFor(() => {
      const [assignee1] = screen.getAllByTestId('assigned-to');
      expect(assignee1).toHaveTextContent('CypressUpd TestUpd');
    });
  });
});
