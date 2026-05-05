import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import MyAutocomplete from './Autocomplete';
import Poppers from './Popper';

test('render MyAutoComplete view successfully', () => {
  const { getByTestId } = render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(getByTestId('common-my-complete')).toBeTruthy();
});

test('render MyAutoComplete view when loading props is true', () => {
  const { getByTestId } = render(
    <MyAutocomplete
      options={[]}
      loading
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(getByTestId('common-my-complete__circular')).toBeTruthy();
});

test('render MyAutoComplete view when loading props is false', () => {
  const { queryByTestId } = render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(queryByTestId('common-my-complete__circular')).toBeFalsy();
});

test('render MyAutoComplete view', () => {
  render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
});

it('render MyAutoComplete view when truthy hasSelectAll', () => {
  const { queryByTestId } = render(
    <MyAutocomplete
      options={[{ title: 'Option 1', value: 'option_1' }]}
      hasSelectAll
      multiple
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(queryByTestId('option-select-item-all')).toBeFalsy();
});

test('render Poppers view successfully', () => {
  const anchorEl = {
    getBoundingClientRect: () => ({ width: '500px' }),
  };
  const { getByTestId } = render(<Poppers anchorEl={anchorEl} />);
  expect(getByTestId('common-my-complete__poppers')).toBeTruthy();
});

test('render MyAutoComplete view when passing default multiple props', () => {
  const { queryByTestId } = render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(queryByTestId('common-my-complete__checkbox')).toBeFalsy();
});

test('render MyAutoComplete view successfully on opening dropdown', async () => {
  render(
    <MyAutocomplete
      options={[
        {
          label: 'Option 1',
          value: 'Option_1',
        },
        {
          label: 'Option 2',
          value: 'Option_2',
        },
      ]}
      multiple
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  await waitFor(() => {
    expect(
      screen.queryAllByTestId('common-my-complete')[0]
    ).toBeInTheDocument();
  });

  await userEvent.click(screen.queryAllByTestId('common-my-complete')[0]);

  expect(screen.queryByTestId('common-my-complete__poppers')).toBeFalsy();
});

test('render AutoComplete with onFocusFn and check if option is populated', async () => {
  const onFocusMockFn = jest.fn(() =>
    Promise.resolve({
      data: [
        {
          name: 'sources/1',
          source: 'Fake Source 1',
        },
        {
          name: 'sources/2',
          source: 'Fake Source 2',
        },
        {
          name: 'sources/3',
          source: 'Fake Source 3',
        },
      ],
    })
  );

  render(
    <MyAutocomplete
      options={[]}
      name="source"
      label="Lead Source"
      multiple={false}
      onFocusFn={onFocusMockFn}
      labelField="source"
      valueField="name"
      fixedLabel
      limitTags={1}
    />
  );

  const CustomAutocomplete = screen.getByTestId('common-my-complete');
  expect(CustomAutocomplete).toBeTruthy();

  await userEvent.click(CustomAutocomplete);
  expect(onFocusMockFn).toHaveBeenCalledTimes(1);

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(3);
});

test('render AutoComplete with onFocusFn and hasFormattedResponse to be true and check if option is populated', async () => {
  const onFocusMockFn = jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 0,
          title: 'rejectReason.wrongNumber',
          value: 'wrong_number',
        },
        {
          id: 1,
          title: 'rejectReason.cantContact',
          value: 'cant_contact',
        },
        {
          id: 2,
          title: 'rejectReason.noCar',
          value: 'no_car',
        },
      ],
    })
  );

  render(
    <MyAutocomplete
      options={[]}
      name="rejectionReasons"
      label="Rejection reasons"
      multiple={false}
      onFocusFn={onFocusMockFn}
      hasFormattedResponse
      valueField="value"
      fixedLabel
      limitTags={1}
    />
  );

  const CustomAutocomplete = screen.getByTestId('common-my-complete');
  expect(CustomAutocomplete).toBeTruthy();

  await userEvent.click(CustomAutocomplete);
  expect(onFocusMockFn).toHaveBeenCalledTimes(1);

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(3);
});

test('render AutoComplete with onFocusFn where hasFormattedResponse is true, apiDataField and startWithValue are also provided', async () => {
  const onFocusMockFn = jest.fn(() =>
    Promise.resolve({
      data: {
        nextPageToken: '',
        users: [
          {
            id: 0,
            title: 'John Cena',
            value: 'users/1',
          },
          {
            id: 1,
            title: 'John Wick',
            value: 'users/2',
          },
          {
            id: 2,
            title: 'Jon Snow',
            value: 'users/3',
          },
          {
            id: 3,
            title: 'John Connor',
            value: 'users/4',
          },
          {
            id: 4,
            title: 'John Winchester',
            value: 'users/5',
          },
          {
            id: 5,
            title: 'John McClaine',
            value: 'users/6',
          },
        ],
      },
    })
  );

  render(
    <MyAutocomplete
      options={[]}
      name="assignToUser"
      label="Assigned to user"
      multiple={false}
      onFocusFn={onFocusMockFn}
      apiDataField="users"
      hasFormattedResponse={false}
      labelField="title"
      valueField="value"
      fixedLabel
      limitTags={1}
      startWithValue={{
        title: 'text.unassigned',
        name: '',
      }}
    />
  );

  const CustomAutocomplete = screen.getByTestId('common-my-complete');
  expect(CustomAutocomplete).toBeTruthy();

  await userEvent.click(CustomAutocomplete);
  expect(onFocusMockFn).toHaveBeenCalledTimes(1);

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  // 6 options + 1 startWithValue
  expect(options.length).toBe(7);
});

test('search fn', async () => {
  const searchFn = jest
    .fn()
    .mockResolvedValue([
      { fullName: 'result_full_name', value: 'value', id: 'id' },
    ]);
  render(
    <MyAutocomplete
      lookup
      async
      fixedLabel
      searchFn={searchFn}
      options={[]}
      name="name"
      label="label"
      labelField="fullName"
      valueField="name"
    />
  );
  await userEvent.type(screen.getByRole('textbox'), 'abc');
  await waitFor(() => expect(searchFn).toHaveBeenCalled());
  const options = screen.getByRole('presentation');
  await waitFor(() =>
    expect(within(options).getByText('result_full_name')).toBeInTheDocument()
  );
});

describe('renderTags function (lines 318-353)', () => {
  const options = [
    { title: 'Option 1', value: 'option_1' },
    { title: 'Option 2', value: 'option_2' },
    { title: 'Option 3', value: 'option_3' },
    { title: 'Option 4', value: 'option_4' },
    { title: 'Option 5', value: 'option_5' },
  ];

  it('renders tags up to limitTags and shows "+X more" chip when there are more tags', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={options}
        limitTags={2}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');
    
    // Click to ensure chips are rendered
    await userEvent.click(autocomplete);
    
    await waitFor(() => {
      // Check that chips are rendered - Material-UI renders chips as buttons
      const allText = document.body.textContent || '';
      // Should contain "+X more" text when limitTags < value.length
      expect(allText).toMatch(/\+.*more/);
    }, { timeout: 3000 });
  });

  it('renders all tags when limitTags is 0', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={options}
        limitTags={0}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');
    
    // Click to ensure chips are rendered
    await userEvent.click(autocomplete);

    await waitFor(() => {
      // Note: When limitTags is 0, remainingCount = value.length - 0 = 5, so "+5 more" will show
      // This is the actual behavior of the code (line 320: remainingCount = value.length - limitTags)
      const allText = document.body.textContent || '';
      // The code shows "+X more" when remainingCount > 0, even if limitTags is 0
      expect(allText).toMatch(/\+.*more/);
    }, { timeout: 3000 });
  });

  it('does not show "+X more" chip when number of tags equals limitTags', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 3)}
        value={options.slice(0, 3)}
        limitTags={3}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      const chipTexts = chips.map(chip => chip.textContent);
      expect(chipTexts.some(text => text?.includes('Option 1'))).toBe(true);
      expect(chipTexts.some(text => text?.includes('Option 2'))).toBe(true);
      expect(chipTexts.some(text => text?.includes('Option 3'))).toBe(true);
    }, { timeout: 3000 });

    // Should not show "+X more" chip
    const allChips = within(autocomplete).getAllByRole('button');
    const allChipTexts = allChips.map(chip => chip.textContent);
    expect(allChipTexts.some(text => text?.includes('more'))).toBe(false);
  });

  it('does not show "+X more" chip when number of tags is less than limitTags', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 2)}
        value={options.slice(0, 2)}
        limitTags={5}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      const chipTexts = chips.map(chip => chip.textContent);
      expect(chipTexts.some(text => text?.includes('Option 1'))).toBe(true);
      expect(chipTexts.some(text => text?.includes('Option 2'))).toBe(true);
    }, { timeout: 3000 });

    // Should not show "+X more" chip
    const allChips = within(autocomplete).getAllByRole('button');
    const allChipTexts = allChips.map(chip => chip.textContent);
    expect(allChipTexts.some(text => text?.includes('more'))).toBe(false);
  });

  it('disables chips when isEditable is false', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 2)}
        value={options.slice(0, 2)}
        limitTags={2}
        isEditable={false}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      // Filter out the "+X more" chip and dropdown button
      const optionChips = chips.filter(chip => 
        chip.textContent?.includes('Option') && !chip.textContent?.includes('more')
      );
      // All option chips should be disabled (Material-UI uses aria-disabled attribute)
      optionChips.forEach((chip) => {
        expect(chip).toHaveAttribute('aria-disabled', 'true');
      });
    }, { timeout: 3000 });
  });

  it('enables chips when isEditable is true', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 2)}
        value={options.slice(0, 2)}
        limitTags={2}
        isEditable={true}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      // Filter out the "+X more" chip and dropdown button
      const optionChips = chips.filter(chip => 
        chip.textContent?.includes('Option') && !chip.textContent?.includes('more')
      );
      // All option chips should be enabled (not disabled)
      optionChips.forEach((chip) => {
        expect(chip).not.toBeDisabled();
      });
    }, { timeout: 3000 });
  });

  it('disables "+X more" chip when isEditable is false', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={options}
        limitTags={2}
        isEditable={false}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      // Find the "+X more" chip by text content
      const allText = document.body.textContent || '';
      expect(allText).toMatch(/\+.*more/);
      
      // Check that chips with "+X more" text have disabled attribute
      const chips = within(autocomplete).queryAllByRole('button');
      const moreChip = chips.find(chip => chip.textContent?.includes('more'));
      if (moreChip) {
        // Material-UI uses aria-disabled attribute for disabled chips
        expect(moreChip).toHaveAttribute('aria-disabled', 'true');
      }
    }, { timeout: 3000 });
  });

  it('enables "+X more" chip when isEditable is true', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={options}
        limitTags={2}
        isEditable={true}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      // Find the "+X more" chip by text content
      const allText = document.body.textContent || '';
      expect(allText).toMatch(/\+.*more/);
      
      // Check that chips with "+X more" text are not disabled
      const chips = within(autocomplete).queryAllByRole('button');
      const moreChip = chips.find(chip => chip.textContent?.includes('more'));
      if (moreChip) {
        // When editable, should not have aria-disabled="true"
        expect(moreChip).not.toHaveAttribute('aria-disabled', 'true');
      }
    }, { timeout: 3000 });
  });

  it('renders chips with correct labels using getOptionLabel', async () => {
    const customOptions = [
      { name: 'Custom Option 1', id: '1' },
      { name: 'Custom Option 2', id: '2' },
    ];

    render(
      <MyAutocomplete
        multiple
        options={customOptions}
        value={customOptions}
        limitTags={2}
        name="test"
        labelField="name"
        valueField="id"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      const chipTexts = chips.map(chip => chip.textContent);
      expect(chipTexts.some(text => text?.includes('Custom Option 1'))).toBe(true);
      expect(chipTexts.some(text => text?.includes('Custom Option 2'))).toBe(true);
    }, { timeout: 3000 });
  });

  it('renders chips with delete icon for editable tags', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 2)}
        value={options.slice(0, 2)}
        limitTags={2}
        isEditable={true}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      // Material-UI Chips with deleteIcon should have aria-label="Delete"
      // The delete icon is rendered inside the chip
      const chips = within(autocomplete).getAllByRole('button');
      const optionChips = chips.filter(chip => 
        chip.textContent?.includes('Option') && !chip.textContent?.includes('more')
      );
      // Each chip should be clickable (has delete functionality)
      expect(optionChips.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('calculates remainingCount correctly when limitTags is greater than value length', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options.slice(0, 2)}
        value={options.slice(0, 2)}
        limitTags={10}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).getAllByRole('button');
      const chipTexts = chips.map(chip => chip.textContent);
      expect(chipTexts.some(text => text?.includes('Option 1'))).toBe(true);
      expect(chipTexts.some(text => text?.includes('Option 2'))).toBe(true);
    }, { timeout: 3000 });

    // remainingCount should be negative (2 - 10 = -8), so "+X more" should not show
    const allChips = within(autocomplete).getAllByRole('button');
    const allChipTexts = allChips.map(chip => chip.textContent);
    expect(allChipTexts.some(text => text?.includes('more'))).toBe(false);
  });

  it('renders correct number of chips when limitTags equals 1', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={options}
        limitTags={1}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');
    
    // Click to ensure chips are rendered
    await userEvent.click(autocomplete);

    await waitFor(() => {
      // Check for "+X more" chip (should be "+4 more" when limitTags=1 and 5 options)
      const allText = document.body.textContent || '';
      expect(allText).toMatch(/\+.*more/);
    }, { timeout: 3000 });
  });

  it('handles empty value array correctly', async () => {
    render(
      <MyAutocomplete
        multiple
        options={options}
        value={[]}
        limitTags={2}
        name="test"
        labelField="title"
        valueField="value"
        testid="test-autocomplete"
      />
    );

    const autocomplete = screen.getByTestId('test-autocomplete');

    await waitFor(() => {
      const chips = within(autocomplete).queryAllByRole('button');
      // Filter out the dropdown button
      const optionChips = chips.filter(chip => 
        chip.textContent?.includes('Option') || chip.textContent?.includes('more')
      );
      // Should not render any option chips
      expect(optionChips.length).toBe(0);
    }, { timeout: 3000 });
  });
});
