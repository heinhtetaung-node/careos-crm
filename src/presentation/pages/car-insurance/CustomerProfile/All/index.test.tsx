import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CustomerDashBoard from '.';

describe('Testing <CustomerDashboard />', () => {
  const user = userEvent.setup();
  it('should render Customer dashboard', () => {
    render(<CustomerDashBoard />);
    expect(screen.getByTestId('customer-dashboard')).toBeInTheDocument();
  });

  it('should apply filter and then reset the filter', async () => {
    render(<CustomerDashBoard />);
    const searchOptionBTn = document.getElementById(
      'mui-component-select-selectValue'
    );
    await user.click(searchOptionBTn as HTMLElement);
    const searchOptions = screen.getAllByRole('option');
    await user.click(searchOptions[0] as HTMLElement);
    const searchInput = screen.getAllByRole('textbox');
    await user.type(searchInput[0], 'test');

    expect((searchInput[0] as HTMLInputElement).value).toBe('test');

    const resetBtn = screen.getByTestId('reset-btn');
    await user.click(resetBtn);

    expect((searchInput[0] as HTMLInputElement).value).toBe('');
  });
});
