/* eslint-disable no-restricted-syntax */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CustomerMergeDetailPage from '.';

describe('Testing <CustomerDashboard />', () => {
  it('should render <CustomerMergeDetailPage />', () => {
    render(<CustomerMergeDetailPage />);
    expect(screen.getByTestId('customer-merge-page')).toBeInTheDocument();
  });

  it('should enable submit button after moving all cells from a column', async () => {
    render(<CustomerMergeDetailPage />);
    const buttons = screen.getAllByTestId('cell-move-button');
    const leadsFirstColButton1 = buttons[0];
    const leadsFirstColButton2 = buttons[1];
    const ordersSecondColButton1 = buttons[7];
    const ordersSecondColButton2 = buttons[8];

    await userEvent.click(leadsFirstColButton1);
    await userEvent.click(leadsFirstColButton2);
    await userEvent.click(ordersSecondColButton1);
    await userEvent.click(ordersSecondColButton2);

    expect(screen.getByTestId('submit-button')).toBeEnabled();
  });

  it('should reset cells after clicking reset button', async () => {
    render(<CustomerMergeDetailPage />);
    const buttons = screen.getAllByTestId('cell-move-button');

    for await (const button of buttons) {
      userEvent.click(button);
    }

    await userEvent.click(screen.getByTestId('reset-button'));
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });
});
