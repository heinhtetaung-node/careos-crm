import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';

import DiscountVoucherPage from '.';

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

describe('Testing Discount Voucher Page', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/vouchers`,
        () =>
          HttpResponse.json({
            vouchers: DiscountMockData.vouchers,
            nextPageToken: DiscountMockData.nextPageToken,
          })
      )
    );
    render(<DiscountVoucherPage />, { initialState });
  });

  it('should render VoucherPage', async () => {
    expect(screen.getByTestId('voucher-page')).toBeInTheDocument();

    await waitForElementToBeRemoved(
      screen.getAllByTestId('data-table-skeleton')
    );
    await waitFor(() => {
      expect(screen.queryAllByTestId('data-table-skeleton').length).toBe(0);
    });
  });

  it('should show create voucher modal on click of a button', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create menu.discounts.voucher' })
    );
    await waitFor(() => {
      expect(screen.getByTestId('discount-voucher-modal')).toBeInTheDocument();
    });
  });

  it('should close the modal on click of cancel button', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create menu.discounts.voucher' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
    await waitFor(() => {
      expect(screen.queryByTestId('discount-voucher-modal')).toBeNull();
    });
  });

  it('should close the modal on click of close icon', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create menu.discounts.voucher' })
    );
    await userEvent.click(screen.getAllByTestId('close-button')[0]);

    await waitFor(() => {
      expect(screen.queryByTestId('discount-voucher-modal')).toBeNull();
    });
  });
});

describe('Testing Filters', () => {
  beforeEach(async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/vouchers`,
        (_) =>
          HttpResponse.json({
            vouchers: DiscountMockData.vouchers,
            nextPageToken: DiscountMockData.nextPageToken,
          })
      )
    );
    render(<DiscountVoucherPage />, { initialState });
    expect(screen.getByTestId('voucher-page')).toBeInTheDocument();

    await waitForElementToBeRemoved(
      screen.getAllByTestId('data-table-skeleton')
    );
    await waitFor(() => {
      expect(screen.queryAllByTestId('data-table-skeleton').length).toBe(0);
    });
  });

  it('should filter and render the data accordingly', async () => {
    const voucherTypeElem = screen.getByTestId(
      'muiSelect-selectValue'
    ).firstElementChild!;
    const submitBtn = screen.getByTestId('submit-btn');

    await userEvent.click(voucherTypeElem);
    await userEvent.click(screen.getAllByRole('option')[1]);

    await userEvent.type(
      screen.getByTestId('input-inputValue').firstElementChild!,
      'voucherAD56'
    );
    expect(submitBtn).toBeEnabled();
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.queryAllByTestId('data-table-skeleton')).toHaveLength(0)
    );
    await waitFor(() => {
      expect(screen.getAllByRole('cell')[2]).toHaveTextContent('voucherAD56');
    });
  });

  it('should reset the filter if clicked on reset button', () => {
    const voucherTypeElem = screen.getByTestId(
      'muiSelect-selectValue'
    ).firstElementChild!;

    userEvent.click(voucherTypeElem);
    userEvent.click(screen.getAllByRole('option')[2]);

    userEvent.click(screen.getByTestId('reset-btn'));

    expect(voucherTypeElem).toHaveTextContent('text.select');
  });
});
