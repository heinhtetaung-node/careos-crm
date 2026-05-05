import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import { MockUsersData } from 'mock-data/UserData.mock';
import { store } from 'presentation/redux/store';

import OrderApprovalPage from '.';

var mockHandleReset: jest.Mock;

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

const mockedDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockedDispatch),
}));

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: PropsWithChildren<any>) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

test('render order document list view successfully', () => {
  render(<OrderApprovalPage />);

  expect(screen.getByTestId('order-approval-page')).toHaveTextContent(
    'text.entries'
  );
});

// TODO: I'm incorrect, please correct me
describe.skip('Test policy listing table with formatted column', () => {
  test('approval listing will show policy table when clicking expand icon', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
        () => HttpResponse.json(MockOrderDocuments)
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      )
    );

    render(
      <ComponentWithProvider>
        <OrderApprovalPage />
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

      expect(
        within(policyTable).getByText('approveStatus.pending')
      ).toBeInTheDocument();
    });
  });
});

describe('Test filter panel', () => {
  it('Approval listing view reset filter when Reset button clicked', async () => {
    render(
      <ComponentWithProvider>
        <OrderApprovalPage />
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
    render(<OrderApprovalPage />);
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
});

describe('Test filter panel', () => {
  it('Should select a delivery option, perform a search, and reset the preferred delivery option when Reset button is clicked', async () => {
    render(
      <ComponentWithProvider>
        <OrderApprovalPage />
      </ComponentWithProvider>
    );

    const deliveryDropdown = within(
      screen.getByTestId('muiSelect-preferredDeliveryOption')
    ).getByRole('button');

    await userEvent.click(deliveryDropdown);

    const dropdown = screen.getByRole('listbox');

    await userEvent.click(
      within(dropdown).getByRole('option', {
        name: 'qc.digitalDelivery',
      })
    );

    const searchButton = screen.getByTestId('submit-btn');

    expect(searchButton).toBeEnabled();
    await userEvent.click(searchButton);
    expect(mockedDispatch).toHaveBeenCalled();

    const resetBtn = screen.getByRole('button', { name: 'text.reset' });
    expect(resetBtn).toBeEnabled();
    await userEvent.click(resetBtn);
    expect(mockHandleReset).toHaveBeenCalled();
  });
});
