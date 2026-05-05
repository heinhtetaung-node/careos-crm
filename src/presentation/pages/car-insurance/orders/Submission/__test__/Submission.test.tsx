import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import { MockUsersData } from 'mock-data/UserData.mock';
import { store } from 'presentation/redux/store';

import OrderSubmissionPage from '..';

var mockHandleReset: jest.Mock;
var mockUseGetAuthenticateQuery: jest.Mock;

jest.mock('presentation/pages/car-insurance/orders/table.helper.ts', () => {
  mockHandleReset = jest.fn();
  return {
    __esModule: true, // need this to require es module default export
    ...jest.requireActual(
      'presentation/pages/car-insurance/orders/table.helper.ts'
    ),
    handleReset: mockHandleReset,
  };
});

jest.mock('data/slices/authSlice', () => {
  mockUseGetAuthenticateQuery = jest.fn().mockReturnValue({
    data: {
      role: 'roles/admin',
    },
  });
  return {
    useGetAuthenticateQuery: mockUseGetAuthenticateQuery,
  };
});

const storeRef = setupApiStore(apiSlice);

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

function ComponentWithProvider({ children }: PropsWithChildren<any>) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

test('render order document list view successfully', () => {
  render(<OrderSubmissionPage />);

  expect(screen.getByTestId('order-submission-page')).toHaveTextContent(
    'text.entries'
  );
});

describe('Test policy listing table with formatted column', () => {
  // TODO: Refactor
  test.skip('submission listing will show policy table when clicking expand icon', async () => {
    render(
      <ComponentWithProvider>
        <OrderSubmissionPage />
      </ComponentWithProvider>
    );
    await waitFor(async () => {
      const expandIcon = screen.getByTestId('O57083-expand-row-button');

      await userEvent.click(expandIcon);
      expect(screen.getByText('O57083-1')).toBeInTheDocument();

      const policyTable = screen.getByTestId('policy-table');

      expect(
        within(policyTable).getByText('submissionStatus.pending')
      ).toBeInTheDocument();
    });
  });
});

describe('Test filter panel', () => {
  test('Submission listing view called reset button', async () => {
    render(
      <ComponentWithProvider>
        <OrderSubmissionPage />
      </ComponentWithProvider>
    );

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

    const resetBtn = screen.getByRole('button', { name: 'text.reset' });

    expect(resetBtn).toBeEnabled();
    await userEvent.click(resetBtn);
    expect(mockHandleReset).toHaveBeenCalled();
  });

  it('Should cancelled orders checkbox clear on reset', async () => {
    render(<OrderSubmissionPage />);
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

  it('Should not get assign to team field when user is not admin', () => {
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: {
        role: 'roles/agent',
      },
    });
    render(<OrderSubmissionPage />);
    expect(screen.queryByText('text.assignedToTeam')).not.toBeInTheDocument();
  });
});

describe('Test update cache after agent assignment', () => {
  test.skip('should update cache at policy level after agent assignment', async () => {
    render(<OrderSubmissionPage />);
    const expandIcon = await screen.findByTestId('O57083-expand-row-button');
    await userEvent.click(expandIcon);
    const checkboxContainer = screen.getByTestId('shipment-policy-O57083-1');
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
      const [assignee1, assignee2] = screen.getAllByTestId('assigned-to');
      expect(assignee1).toHaveTextContent('CypressUpd TestUpd');
      expect(assignee2).toHaveTextContent('-');
    });
  });
});
