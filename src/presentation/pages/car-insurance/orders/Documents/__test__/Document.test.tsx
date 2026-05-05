import userEvent from '@testing-library/user-event';
import _truncate from 'lodash/truncate';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockInsurers } from 'mock-data/Insurers.mock';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import { MockUsersData } from 'mock-data/UserData.mock';
import { columnDocumentsQC } from 'presentation/components/OrderListingTable/helper';
import { TRUNCATE_OPTIONS } from 'presentation/components/OrderListingTable/TableData';
import TableHeader from 'presentation/components/OrderListingTable/TableHeader';
import { store } from 'presentation/redux/store';
import {
  changeSortStatus,
  SORT_TABLE_TYPE,
  getOrderByField,
} from 'shared/helper/utilities';

import OrderDocumentsPage from '..';

var mockHandleSearch: jest.Mock;
var mockGetQueryParts: jest.Mock;
var mockHandleReset: jest.Mock;

jest.mock('data/gateway/api/resource/leadSearch', () => {
  mockGetQueryParts = jest.fn(() => ['dummy']);
  return {
    ...jest.requireActual('data/gateway/api/resource/leadSearch'),
    getQueryParts: mockGetQueryParts,
  };
});

const mockedDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockedDispatch),
}));

jest.mock('presentation/pages/car-insurance/orders/table.helper.ts', () => {
  mockHandleReset = jest.fn();
  return {
    __esModule: true,
    ...jest.requireActual(
      'presentation/pages/car-insurance/orders/table.helper.ts'
    ),
    handleReset: mockHandleReset,
  };
});
jest.mock('presentation/pages/car-insurance/orders/useOrderSearch', () => {
  mockHandleSearch = jest.fn();
  return {
    __esModule: true,
    ...jest.requireActual(
      'presentation/pages/car-insurance/orders/useOrderSearch'
    ),
    default: jest.fn().mockReturnValue({
      handleSearch: mockHandleSearch,
    }),
  };
});

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({}),
}));

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: PropsWithChildren<any>) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

describe('Test render order document listing view', () => {
  test('render order document list view successfully', () => {
    render(<OrderDocumentsPage />);

    expect(screen.getByTestId('order-document-page')).toHaveTextContent(
      'leadDetailFields.orderId'
    );
  });
});

describe('Test order document listing view with formatted columns', () => {
  it('render order document list view with sales agent, insured person, assigned to, cancellation successfully', async () => {
    server.use(
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
        () => HttpResponse.json(MockOrderDocuments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () => HttpResponse.json(MockInsurers)
      )
    );
    render(
      <ComponentWithProvider>
        <OrderDocumentsPage />
      </ComponentWithProvider>
    );

    await waitFor(
      () => {
        const [order1, order2, order3] = MockOrderDocuments.orders;
        const rows = screen.queryAllByTestId('order-listing-table-row');

        // show sales agent name
        expect(rows[0]).toHaveTextContent('CypressUpd TestUpd');
        expect(rows[1]).toHaveTextContent('website');

        // show both insurer and customer name when they are not the same person.
        let insuredPerson = `${_truncate(
          `${order1.order.data.policyHolder.firstName} ${order1.order.data.policyHolder.lastName}`,
          TRUNCATE_OPTIONS
        )}(${_truncate(
          `${order1.customer.firstName} ${order1.customer.lastName}`,
          TRUNCATE_OPTIONS
        )})`;
        expect(rows[0]).toHaveTextContent(insuredPerson);

        // show insurer name when they are same person
        insuredPerson = _truncate(
          `${order2.order.data.policyHolder.firstName} ${order2.order.data.policyHolder.lastName}`,
          TRUNCATE_OPTIONS
        );
        expect(rows[1]).toHaveTextContent(insuredPerson);

        // show assigned to data(document agent)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { firstName, lastName, humanId } = order3.documentAgent!;
        const assignedTo = `${_truncate(
          `${firstName} ${lastName}`,
          TRUNCATE_OPTIONS
        )}${_truncate(humanId, TRUNCATE_OPTIONS)}`;
        expect(rows[2]).toHaveTextContent(assignedTo);

        // show cancelled status when every policy under an order is cancelled
        expect(rows[2]).toHaveTextContent('text.cancelled');

        // cancelled order should be grey text
        const columns = within(rows[2]).getAllByTestId(
          'order-listing-table-column'
        );
        const documentStaus = within(columns[0]).getByText(
          'documentStatus.pending'
        );
        const styles = window.getComputedStyle(documentStaus);
        expect(styles.color).toBe('rgb(165, 170, 192)');

        // show order insurance package
        const packagesContainer = within(rows[1]).getByTestId(
          'insurance-packages'
        );
        const insurancePackages =
          within(packagesContainer).queryAllByTestId('text-chips');
        expect(insurancePackages.length).toBe(2);
        expect(insurancePackages[0]).toHaveTextContent(
          'motoType.typeMandatory'
        );
        expect(insurancePackages[1]).toHaveTextContent('mototype.type2');
      },
      { timeout: 30000, onTimeout: (error) => error }
    );

    const page2 = screen.getByLabelText('Go to page 2');
    await userEvent.click(page2);
    expect(mockGetQueryParts).toHaveBeenCalledWith(
      'car-insurance',
      ['order.isCancelled in ("false")'],
      15,
      2,
      'order_by=attributes.earliestPolicyStartDate desc'
    );
    const selects = await screen.findAllByPlaceholderText('text.select');
    await userEvent.click(selects[0]);
    await userEvent.click(screen.getByText('text.complete'));

    const resetBtn = screen.getByRole('button', { name: 'text.reset' });
    await userEvent.click(resetBtn);
  });
});

describe('Test table order listing table header', () => {
  it('Test customer text show depending on showCustomer flag', () => {
    const { rerender } = render(
      <TableHeader isDisableExpand columnSettings={columnDocumentsQC} />
    );
    expect(screen.queryByTestId('table-header')).toHaveTextContent(
      'text.customer'
    );
    rerender(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        showCustomer={false}
      />
    );
    expect(screen.queryByTestId('table-header')).not.toHaveTextContent(
      'text.customer'
    );
  });

  it('Test chassis number text show depending on showChassis flag', () => {
    const { rerender } = render(
      <TableHeader isDisableExpand columnSettings={columnDocumentsQC} />
    );
    expect(screen.queryByTestId('table-header')).not.toHaveTextContent(
      'text.chassisNumber'
    );
    rerender(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        showChassisNumber
      />
    );

    expect(screen.queryByTestId('table-header')).toHaveTextContent(
      'text.chassisNumber'
    );
  });

  it('Test column wise sorting', () => {
    render(
      <TableHeader
        isDisableExpand
        columnSettings={columnDocumentsQC}
        handleColumnSort={jest.fn()}
      />
    );
    expect(screen.queryByTestId('table-header')).toBeInTheDocument();
    expect(screen.queryByTestId('table-header')).toHaveTextContent(
      'text.customer'
    );
  });
});

describe('Test changeSortStatus', () => {
  test.each([
    [SORT_TABLE_TYPE.NONE, SORT_TABLE_TYPE.ASC],
    [SORT_TABLE_TYPE.ASC, SORT_TABLE_TYPE.DESC],
    [SORT_TABLE_TYPE.DESC, SORT_TABLE_TYPE.NONE],
  ])('Should be return %s if input %s status for sorting', (a, b) => {
    expect(changeSortStatus(a)).toEqual(b);
  });
});

describe('Test getOrderByField', () => {
  test('Should be return order_by=order.humanId if input asc order for sorting', () => {
    expect(getOrderByField('order.humanId', SORT_TABLE_TYPE.ASC)).toEqual(
      'order_by=order.humanId'
    );
  });
  test('Should not be return order_by=order.humanId if input asc order for sorting', () => {
    expect(getOrderByField('order.humanId', SORT_TABLE_TYPE.NONE)).not.toEqual(
      'order_by=order.humanId'
    );
  });
});
describe('Test filter panel', () => {
  it('Should select a delivery option, perform a search, and reset the preferred delivery option when Reset button is clicked', async () => {
    render(
      <ComponentWithProvider>
        <OrderDocumentsPage />
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
