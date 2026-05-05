import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render } from '__tests__/rtl-test-utils';

import CustomAutocomplete from '.';

const handleUpdate = jest.fn();
const optionsArray = [
  { id: 0, value: 1, title: 'Mercedes' },
  { id: 1, value: 2, title: 'BMW' },
  { id: 2, value: 3, title: 'Toyota' },
  { id: 3, value: 4, title: 'Honda' },
  { id: 4, value: 5, title: 'Mazda' },
];

describe('CustomAutocomplete component', () => {
  const config = {
    title: 'Car Brand',
    name: 'brand',
    handleUpdate,
    isReadOnly: false,
    options: optionsArray,
    error: '',
    dataTestId: 'test-autocomplete',
  };

  it('renders', () => {
    render(<CustomAutocomplete {...config} value={optionsArray[1].value} />);
    const field = screen.getByRole('textbox');
    expect(field).toHaveValue(optionsArray[1].title);
  });

  it('renders with no options', () => {
    render(
      <CustomAutocomplete
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
      <CustomAutocomplete
        {...config}
        isReadOnly
        value={optionsArray[1].value}
      />
    );
    const field = screen.getByTestId('test-autocomplete-readonly');
    expect(field).toHaveTextContent(optionsArray[1].title);
  });

  it('renders readonly for multiple selection as a string', () => {
    const selections = [optionsArray[1].value, optionsArray[2].value];
    render(
      <CustomAutocomplete {...config} isReadOnly multiple value={selections} />
    );
    const field = screen.getByTestId('test-autocomplete-readonly');
    expect(field).toHaveTextContent(
      `${optionsArray[1].title}, ${optionsArray[2].title}`
    );
  });

  it('handles select for single selection', async () => {
    render(<CustomAutocomplete {...config} value={optionsArray[2].value} />);
    const clearBtn = screen.getByRole('button');
    const field = screen.getByRole('textbox');
    await userEvent.click(clearBtn);
    const option3 = screen.getAllByRole('option')[3];
    await userEvent.click(option3);
    await waitFor(() => {
      expect(field).toHaveValue(optionsArray[3].title);
    });
    expect(handleUpdate).toHaveBeenCalled();
  });

  it('should call fallback resolver if value exist but not in option', async () => {
    const mockFn = jest
      .fn()
      .mockReturnValue(
        Promise.resolve({ id: 1, value: 12345, title: 'This is mock value' })
      );
    render(
      <CustomAutocomplete
        {...config}
        value={12345}
        fallbackSelectedValueResolver={mockFn}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox')).toHaveValue('This is mock value')
    );
  });
});
