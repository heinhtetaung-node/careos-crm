import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render } from '__tests__/rtl-test-utils';

import DetailViewAutocomplete from './index';

const handleUpdate = jest.fn();
const optionsArr = [
  'Motor Insurance',
  'Health Insurance',
  'Travel Insurance',
  'Life Insurance',
  'Credit Card Insurance',
];

describe('DetailViewAutocomplete component', () => {
  const config = {
    title: 'Label',
    name: 'loremIpsum',
    handleUpdate,
    isReadOnly: false,
    options: optionsArr,
    error: '',
    dataTestId: 'test-autocomplete',
  };
  it('renders', () => {
    render(<DetailViewAutocomplete {...config} value={optionsArr[0]} />);
    const field = screen.getByRole('textbox');
    expect(field).toHaveValue(optionsArr[0]);
  });

  it('renders with no options', () => {
    render(
      <DetailViewAutocomplete
        title="Test"
        name="loremIpsum"
        handleUpdate={handleUpdate}
        options={[] as any}
      />
    );
    const options = screen.queryAllByRole('option');
    expect(options.length).toBe(0);
  });

  it('renders readonly for single selection', () => {
    render(
      <DetailViewAutocomplete {...config} isReadOnly value={optionsArr[1]} />
    );
    const field = screen.getByTestId('test-autocomplete-readonly');
    expect(field).toHaveTextContent(optionsArr[1]);
  });

  it('renders readonly for multiple selection as a string', () => {
    const selections = [optionsArr[0], optionsArr[2]];
    render(
      <DetailViewAutocomplete
        {...config}
        isReadOnly
        multiple
        value={selections}
      />
    );
    const field = screen.getByTestId('test-autocomplete-readonly');
    expect(field).toHaveTextContent(`${optionsArr[0]}, ${optionsArr[2]}`);
  });

  it('handles select for single selection', async () => {
    render(<DetailViewAutocomplete {...config} value={optionsArr[1]} />);
    const clearBtn = screen.getByRole('button');
    const field = screen.getByRole('textbox');
    await userEvent.click(clearBtn);
    const option3 = screen.getAllByRole('option')[3];
    await userEvent.click(option3);
    await waitFor(() => {
      expect(field).toHaveValue(optionsArr[3]);
    });
    expect(handleUpdate).toHaveBeenCalled();
  });

  it('handles select for multiple selection', async () => {
    render(<DetailViewAutocomplete {...config} multiple />);
    const field = screen.getByRole('textbox');
    await userEvent.type(field, 'L');
    const options = await screen.findAllByRole('option');
    await userEvent.click(options[0]);
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });
    const openBtn = screen.getByLabelText('Open');
    await userEvent.click(openBtn);
    const secondOptions = await screen.findAllByRole('option');
    await userEvent.click(secondOptions[0]);
    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });
    const selections = await screen.findAllByTestId('custom-chip');
    expect(selections.length).toBe(2);
  });
});
