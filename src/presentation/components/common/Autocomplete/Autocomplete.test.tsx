import DriveEtaIcon from '@material-ui/icons/DriveEta';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FlightIcon from '@material-ui/icons/Flight';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import { createFilterOptions } from '@material-ui/lab';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import Autocomplete from '.';

interface FilmOptionType {
  inputValue?: string;
  text: string;
  year?: number;
}

const setOptionValue = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

const optionsArray = [
  'Motor Insurance',
  'Health Insurance',
  'Travel Insurance',
  'Life Insurance',
  'Credit Card Insurance',
];

const optionsArrayObject = [
  { text: 'The Shawshank Redemption', year: 2008 },
  { text: 'The Godfather', year: 1972 },
  { text: 'The Godfather: Part II', year: 1974 },
  { text: 'The Dark Knight', year: 2008 },
  { text: '12 Angry Men', year: 1957 },
  { text: "Schindler's List", year: 2008 },
  { text: 'Pulp Fiction', year: 2008 },
];

const optionsWithCustomKey = [
  {
    label: 'Motor Insurance',
    year: 1999,
    status: { text: 'verified', color: 'success' },
  },
  {
    label: 'Health Insurance',
    year: 2008,
    status: { text: 'verified', color: 'success' },
  },
  {
    label: 'Travel Insurance',
    year: 1999,
    status: { text: 'unverified', isDisabled: true },
  },
  {
    label: 'Life Insurance',
    year: 2008,
    status: { text: 'verified', color: 'success' },
  },
  {
    label: 'Credit Card Insurance',
    year: 1999,
    status: { text: 'verified', color: 'success' },
  },
];

const optionsIcon = [
  { text: 'Motor Insurance', year: 2008, icon: <DriveEtaIcon /> },
  { text: 'Health Insurance', year: 1999, icon: <LocalHospitalIcon /> },
  { text: 'Travel Insurance', year: 1999, icon: <FlightIcon /> },
  { text: 'Life Insurance', year: 2008, icon: <FavoriteIcon /> },
  { text: 'Credit Card Insurance', year: 1999, icon: <FlightIcon /> },
];

const optionsLabel = [
  {
    text: 'Motor Insurance',
    year: 1999,
    label: { text: 'verified', color: 'success' },
  },
  {
    text: 'Health Insurance',
    year: 2008,
    label: { text: 'verified', color: 'success' },
  },
  {
    text: 'Travel Insurance',
    year: 1999,
    label: { text: 'unverified', isDisabled: true },
  },
  {
    text: 'Life Insurance',
    year: 2008,
    label: { text: 'verified', color: 'success' },
  },
  {
    text: 'Credit Card Insurance',
    year: 1999,
    label: { text: 'verified', color: 'success' },
  },
];

const addOptions: FilmOptionType[] = [
  { text: 'The Shawshank Redemption', year: 2008 },
  { text: 'The Godfather', year: 1972 },
  { text: 'The Godfather: Part II', year: 1974 },
  { text: 'The Dark Knight', year: 2008 },
  { text: '12 Angry Men', year: 1957 },
  { text: "Schindler's List", year: 2008 },
  { text: 'Pulp Fiction', year: 2008 },
  { text: 'The Lord of the Rings: The Return of the King', year: 2003 },
  { text: 'The Good, the Bad and the Ugly', year: 1966 },
  { text: 'Fight Club', year: 2008 },
  { text: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
  { text: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980 },
  { text: 'Forrest Gump', year: 1994 },
  { text: 'Inception', year: 2010 },
  { text: 'The Lord of the Rings: The Two Towers', year: 2002 },
  { text: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { text: 'Goodfellas', year: 1990 },
  { text: 'The Matrix', year: 1999 },
  { text: 'Seven Samurai', year: 1954 },
];

test('Autocomplete should renders', () => {
  render(<Autocomplete options={optionsArray} />);
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).not.toHaveValue();
});

test('Autocomplete should renders with default value', () => {
  render(
    <Autocomplete options={optionsArray} defaultValue={optionsArray[0]} />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).toHaveValue('Motor Insurance');
});

test('Autocomplete should renders with array object options', () => {
  render(
    <Autocomplete
      options={optionsArrayObject}
      defaultValue={optionsArrayObject[0]}
    />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).toHaveValue('The Shawshank Redemption');
});

test('Autocomplete dropdown should show with icon', async () => {
  render(<Autocomplete multiple options={optionsIcon} type="icon" />);
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  expect(CustomAutocomplete).toBeTruthy();

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(5);

  options.forEach((option, index) => {
    expect(option).toBeTruthy();
    expect(option.firstChild).toBeTruthy();
    expect(option.firstChild?.nodeName).toBe('svg');
    expect(option.lastChild).toBeTruthy();
    expect(option.lastChild?.nodeValue).toBe(optionsIcon[index].text);
  });
});

test('Autocomplete dropdown should show with checkbox', async () => {
  render(
    <Autocomplete multiple options={optionsArrayObject} type="checkbox" />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  expect(CustomAutocomplete).toBeTruthy();

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(7);

  options.forEach((option, index) => {
    expect(option).toBeTruthy();
    expect(option.firstChild).toBeTruthy();
    expect(option.firstChild).toHaveClass('MuiCheckbox-root');
    expect(option.lastChild).toBeTruthy();
    expect(option.lastChild?.nodeValue).toBe(optionsArrayObject[index].text);
  });
});

test('Autocomplete dropdown should show with label', async () => {
  render(<Autocomplete multiple options={optionsLabel} type="label" />);
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  expect(CustomAutocomplete).toBeTruthy();

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(5);

  options.forEach((option, index) => {
    expect(option).toBeTruthy();
    expect(option.firstChild).toBeTruthy();
    expect(option.firstChild).toHaveClass('labelOptionType');
    expect(option.firstChild?.lastChild).toBeTruthy();
    expect(option.firstChild?.lastChild).toHaveClass('MuiChip-root');
    expect(option.firstChild?.firstChild?.nodeValue).toBe(
      optionsLabel[index].text
    );
  });
});

test('Autocomplete should add new option if not exists multiple', async () => {
  const filterAddNew = createFilterOptions<FilmOptionType>();
  render(
    <Autocomplete
      multiple
      allowAddNew
      options={addOptions}
      onAddNew={setOptionValue}
      filterAddNew={filterAddNew}
    />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).toBeTruthy();

  const mockValue = [
    'Something is not exsits',
    'Something is not exsits again',
  ];
  await userEvent.type(textField, mockValue[0]);
  let options = await screen.findAllByRole('option');

  expect(options.length).toBe(1);
  expect(options[0]).toBeTruthy();
  expect(options[0].querySelector('strong')?.textContent).toBe(
    `“${mockValue[0]}”`
  );

  await userEvent.click(options[0]);
  await waitFor(() => {
    expect(setOptionValue).toHaveBeenCalledWith([
      {
        inputValue: mockValue[0],
        text: mockValue[0],
      },
    ]);
    expect(screen.queryAllByText(mockValue[0])).toBeTruthy();
  });

  await userEvent.type(textField, mockValue[1]);
  options = await screen.findAllByRole('option');

  expect(options.length).toBe(1);
  expect(options[0]).toBeTruthy();

  await userEvent.click(options[0]);
  await waitFor(() => {
    expect(setOptionValue).toHaveBeenCalledWith([
      {
        inputValue: mockValue[0],
        text: mockValue[0],
      },
      {
        inputValue: mockValue[1],
        text: mockValue[1],
      },
    ]);
    expect(screen.queryAllByText(mockValue[0])).toBeTruthy();
  });
});

test('Autocomplete should add new option if not exists single', async () => {
  const filterAddNew = createFilterOptions();
  render(
    <Autocomplete
      allowAddNew
      options={addOptions}
      onAddNew={setOptionValue}
      filterAddNew={filterAddNew}
    />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).toBeTruthy();

  await userEvent.type(textField, 'Something is not exsits single');
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(1);

  expect(options[0]).toBeTruthy();
  expect(options[0].querySelector('strong')?.textContent).toBe(
    '“Something is not exsits single”'
  );
  await userEvent.click(options[0]);
  await waitFor(() => {
    expect(setOptionValue).toHaveBeenCalledWith(
      'Something is not exsits single'
    );
    expect(
      screen.queryAllByText('Something is not exsits single')
    ).toBeTruthy();
  });
});

test('Autocomplete should show No option found', async () => {
  render(<Autocomplete multiple options={optionsArray} />);
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  const textField: HTMLInputElement = CustomAutocomplete.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(CustomAutocomplete).toBeTruthy();
  expect(textField).toBeTruthy();

  await userEvent.type(textField, 'Something is not exsits');
  await waitFor(() =>
    expect(screen.queryByText('text.noOptionsFound')).toBeTruthy()
  );
});

test('Autocomplete should renders with custom key object', async () => {
  render(
    <Autocomplete
      multiple
      type="label"
      options={optionsWithCustomKey}
      optionTextKey="label"
      optionLabelKey="status"
    />
  );
  const CustomAutocomplete = screen.getByTestId('custom-autocomplete');
  expect(CustomAutocomplete).toBeTruthy();

  within(CustomAutocomplete).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(5);

  options.forEach((option, index) => {
    expect(option).toBeTruthy();
    expect(option.firstChild).toBeTruthy();
    expect(option.firstChild).toHaveClass('labelOptionType');
    expect(option.firstChild?.lastChild).toBeTruthy();
    expect(option.firstChild?.lastChild).toHaveClass('MuiChip-root');
    expect(option.firstChild?.firstChild?.nodeValue).toBe(
      optionsLabel[index].text
    );
  });
});
