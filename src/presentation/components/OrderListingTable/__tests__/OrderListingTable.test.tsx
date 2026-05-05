import userEvent from '@testing-library/user-event';
import React from 'react';
import * as ReactRedux from 'react-redux';

import { render, screen } from '__tests__/rtl-test-utils';
import { mockOrderApproval } from 'mock-data/OrderListingView.mock';
import {
  columnSettings,
  formatOrderDocuments,
} from 'presentation/components/OrderListingTable/helper';

import { orderDocumentInput } from './OrderListingTable.helper.test';

import OrderListing from '..';

var mockedUseLocation: jest.Mock;

jest.mock('react-router-dom', () => {
  mockedUseLocation = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useLocation: mockedUseLocation,
  };
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const dispatch = jest.fn();
(ReactRedux.useDispatch as any).mockReturnValue(dispatch);

describe('render OrderListing view successfully', () => {
  it('- Orders All page', () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/all',
      search: '',
      state: undefined,
      hash: '',
    });
    render(
      <OrderListing
        orders={formatOrderDocuments(orderDocumentInput, 'documentAgent')}
        columnSettings={columnSettings}
        isDisableExpand
      />
    );
    expect(screen.getByTestId('order-list-table')).toBeInTheDocument();
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute(
      'href',
      '/orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5'
    );
  });
  it('- Orders QC page', () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/qc',
      search: '',
      state: undefined,
      hash: '',
    });
    render(
      <OrderListing
        orders={formatOrderDocuments(orderDocumentInput, 'qcAgent')}
        columnSettings={columnSettings}
        isDisableExpand
      />
    );
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute(
      'href',
      '/orders/qc/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5'
    );
  });
  it('- Orders Printing and Shipping page', () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/shipment',
      search: '',
      state: undefined,
      hash: '',
    });
    render(
      <OrderListing
        orders={formatOrderDocuments(orderDocumentInput, 'shippingAgent')}
        columnSettings={columnSettings}
      />
    );
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute(
      'href',
      '/orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5'
    );
  });
  it('- Orders Approval page', async () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/approval',
      search: '',
      state: undefined,
      hash: '',
    });

    render(
      <OrderListing
        orders={mockOrderApproval}
        policyTableType="approval"
        columnSettings={columnSettings}
      />
    );
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute('href', '/orders//policies/L9902641/approval');

    const selectAllCheckbox = (
      await screen.findByTestId('select-all')
    ).querySelector('input') as HTMLInputElement;
    expect(selectAllCheckbox).not.toBeChecked();
    userEvent.click(selectAllCheckbox);

    expect(dispatch).toHaveBeenCalled();
  });

  it('- Orders Document page', () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/documents',
      search: '',
      state: undefined,
      hash: '',
    });
    render(
      <OrderListing
        orders={formatOrderDocuments(orderDocumentInput, 'documentAgent')}
        columnSettings={columnSettings}
      />
    );
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute(
      'href',
      '/orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5'
    );
  });

  it('should column wise sorting orders document page', () => {
    mockedUseLocation.mockReturnValue({
      pathname: 'orders/documents',
      search: '',
      state: undefined,
      hash: '',
    });
    render(
      <OrderListing
        orders={formatOrderDocuments(orderDocumentInput, 'documentAgent')}
        columnSettings={columnSettings}
        handleChangePageCurrent={jest.fn()}
        handleSortColumn={jest.fn()}
      />
    );
    const link = screen.getAllByTestId('page-link')[0];
    expect(link).toHaveAttribute(
      'href',
      '/orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5'
    );
  });
});
