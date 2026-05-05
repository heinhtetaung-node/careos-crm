import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { mockTransactionsSnapshot } from 'mock-data/TransactionFee.mock';

import { IField } from '../InfoPanel/type';

import SaleInfo from '.';

var mockShowSuccessSnackbar: jest.Mock;
var mockShowErrorSnackbar: jest.Mock;
jest.mock('utils/snackbar', () => {
  mockShowSuccessSnackbar = jest.fn();
  mockShowErrorSnackbar = jest.fn();
  return jest.fn().mockReturnValue({
    showSuccessSnackbar: mockShowSuccessSnackbar,
    showErrorSnackbar: mockShowErrorSnackbar,
  });
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
  }),
}));

jest.mock('data/slices/transactionSlice', () => ({
  useLazyGetTransactionFeeQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: mockTransactionsSnapshot,
    },
  ]),
}));

const paymentStatusField: IField = {
  title: 'paymentStatus',
  value: 'notFullyPaid',
  type: 'select',
  name: 'isFullyPaid',
  testId: 'sales-payment-status',
};

const initialState = {
  order: {
    payload: OrderDetail.order,
  },
};

describe('Test <SaleInfo /> component', () => {
  it('Should <SaleInfo /> component render successfully', () => {
    render(<SaleInfo />);
    expect(screen.queryByText('order.sale')).toBeInTheDocument();
  });

  it('Should <SaleInfo /> component render payment status and shipment fee field and update successfully', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId`,
        () => HttpResponse.json({ ...OrderDetail.order, isFullyPaid: true })
      )
    );

    const { container } = render(
      <SaleInfo
        extraFields={[paymentStatusField]}
        includeFields={['Shipment Fee']}
      />,
      { initialState }
    );

    const buttons = container.querySelector(
      'div[id=mui-component-select-isFullyPaid]'
    ) as HTMLButtonElement;
    expect(buttons).toBeInTheDocument();
    await userEvent.click(buttons);

    const presentation = await screen.findByRole('presentation');
    expect(presentation).toBeInTheDocument();

    const fullyPaidOption = screen.getByTestId('muiSelect-menuItem-1');
    await userEvent.click(fullyPaidOption);

    expect(
      ((await screen.findByTestId('select-isFullyPaid')) as HTMLInputElement)
        .value
    ).toBe('fullyPaid');
    await waitFor(() => {
      expect(mockShowSuccessSnackbar).toHaveBeenCalled();
    });
  });

  it('Should <SaleInfo /> component render payment status and shipment fee field and update failed', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId`,
        () => HttpResponse.json({ error: 'failed message' })
      )
    );

    const { container } = render(
      <SaleInfo
        extraFields={[paymentStatusField]}
        includeFields={['Shipment Fee']}
      />,
      { initialState }
    );

    const buttons = container.querySelector(
      'div[id=mui-component-select-isFullyPaid]'
    ) as HTMLButtonElement;
    expect(buttons).toBeInTheDocument();
    await userEvent.click(buttons);

    const fullyPaidOption = screen.getByTestId('muiSelect-menuItem-1');
    await userEvent.click(fullyPaidOption);

    expect(
      ((await screen.findByTestId('select-isFullyPaid')) as HTMLInputElement)
        .value
    ).toBe('fullyPaid');
    await waitFor(() => {
      expect(mockShowErrorSnackbar).toHaveBeenCalled();
    });
  });

  it('Should show the invoice price, processing fee, supervisor and salesAgent', () => {
    render(<SaleInfo />, { initialState });

    expect(screen.queryByText('qc.invoicePrice')).toBeInTheDocument();
    expect(
      screen.queryByText('paymentDetails.processingFee')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('leadDetailFields.supervisor')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('leadDetailFields.salesAgent')
    ).toBeInTheDocument();
  });
});
