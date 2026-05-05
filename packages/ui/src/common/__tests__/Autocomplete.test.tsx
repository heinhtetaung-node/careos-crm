import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoComplete from '../Autocomplete';
import userEvent from '@testing-library/user-event';

const items = [
  { title: 'Item 1', value: 'item1' },
  { title: 'Item 2', value: 'item2' },
  { title: 'Item 3', value: 'item3' },
];

describe('AutoComplete', () => {
  it('renders the input element', () => {
    render(<AutoComplete options={items} onChange={() => {}} />);
    const inputElement = screen.getByRole('combobox');
    expect(inputElement).toBeInTheDocument();
  });

  it('renders the menu when the input is focused', async () => {
    render(<AutoComplete options={items} onChange={() => {}} />);
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    const menuElement = screen.getByRole('listbox');
    expect(menuElement).toBeInTheDocument();
  });

  it('renders the correct number of items in the menu', async () => {
    render(<AutoComplete options={items} onChange={() => {}} />);
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    const menuItems = screen.getAllByRole('option');
    expect(menuItems).toHaveLength(items.length);
  });

  it('filters the menu items based on the input value', async () => {
    render(<AutoComplete options={items} onChange={() => {}} />);
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    await userEvent.type(inputElement, 'Item 2');
    const menuItems = screen.getAllByRole('option');
    expect(menuItems).toHaveLength(1);
    expect(menuItems[0]).toHaveTextContent('Item 2');
  });

  it('selects an item when clicked', async () => {
    const onChange = jest.fn();
    render(<AutoComplete options={items} onChange={onChange} />);
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    const menuItems = screen.getAllByRole('option');
    await userEvent.click(menuItems[1]);
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([items[1]]));
  });

  it('adds the selected item to the list of selected items', async () => {
    const onChange = jest.fn();
    render(<AutoComplete options={items} onChange={onChange} />);
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    const menuItems = screen.getAllByRole('option');
    await userEvent.click(menuItems[1]);
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([items[1]]));

    const selectedItems = screen.getAllByTestId('selected-item');
    expect(selectedItems).toHaveLength(1);
    expect(selectedItems[0]).toHaveTextContent('Item 2');
  });

  it('removes the selected item from the list of selected items when clicked', async () => {
    const onChange = jest.fn();
    render(
      <AutoComplete
        options={items}
        optionType={'checkbox'}
        onChange={onChange}
      />
    );
    const inputElement = screen.getByRole('combobox');
    await userEvent.click(inputElement);
    const menuItems = screen.getAllByRole('option');
    await userEvent.click(menuItems[1]);
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([items[1]]));

    const selectedItems = screen.getAllByTestId('selected-item');
    expect(selectedItems).toHaveLength(1);

    const removeButton = screen.getByTestId('remove-selected-item');
    await userEvent.click(removeButton);
    expect(screen.queryAllByTestId('selected-item')).toHaveLength(0);
  });
});
