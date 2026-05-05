import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import OrderAllPage from '.';

const mockedDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockedDispatch),
}));

test('render order all list with new columns', () => {
  render(<OrderAllPage />);
  expect(screen.getByTestId('travel-all-listing-page')).toBeInTheDocument();
});

describe('Test filter panel', () => {
  it('Test filter panel reset handler called when reset button clicked', async () => {
    render(<OrderAllPage />);

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
    expect((search as any).value).toBe('');
  });
});
