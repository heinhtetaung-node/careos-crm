/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';
import { getString } from 'presentation/theme/localization';

import ComboSearchField from '.';

const options = [
  { option: 'Order ID', value: 'orderId' },
  { option: 'Customer', value: 'customer' },
];

describe('Test <ComboSearchField/>', () => {
  it('<ComboSearchField/> render successfully', () => {
    const handleDataUpdate = jest.fn();
    render(
      <ComboSearchField options={options} handleDataUpdate={handleDataUpdate} />
    );
    expect(
      screen.getByPlaceholderText(`${getString('text.search')}...`)
    ).toBeInTheDocument();
  });

  it('<ComboSearchField/> called callback with searchBy and searchTerm values', async () => {
    const handleDataUpdate = jest.fn();
    render(
      <ComboSearchField options={options} handleDataUpdate={handleDataUpdate} />
    );
    const searchInput = screen.getByPlaceholderText(
      `${getString('text.search')}...`
    );
    await userEvent.type(searchInput, '1234');
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).toHaveBeenCalledWith({
      searchBy: options[0].value,
      searchTerm: '1234',
    });
    await userEvent.keyboard('{Tab}');
    expect(handleDataUpdate).toHaveBeenCalledWith({
      searchBy: options[0].value,
      searchTerm: '1234',
    });
  });

  it('<ComboSearchField/> select search by value and called callback', async () => {
    const handleDataUpdate = jest.fn();
    render(
      <ComboSearchField options={options} handleDataUpdate={handleDataUpdate} />
    );
    const combobox = screen.getByRole('combobox');
    const input = screen.getByPlaceholderText(`${getString('text.search')}...`);
    const selectField = combobox.querySelector('input')!;
    // click select field to show the dropdown
    await userEvent.click(selectField);
    const menu = await screen.findByRole('presentation');
    const secondOption = within(menu).getByText(options[1].option);
    // click second option which is customer
    await userEvent.click(secondOption);
    // type some search term
    await userEvent.type(input, 'Name');
    // search!!
    await userEvent.keyboard('{Enter}');
    expect(handleDataUpdate).toHaveBeenCalledWith({
      searchBy: options[1].value,
      searchTerm: 'Name',
    });
  });
});
