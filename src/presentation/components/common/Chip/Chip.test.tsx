import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import Chip from '.';

const handleClick = jest.fn();
const handleDelete = jest.fn();

const optionsData = [
  { title: 'The Lord of the Rings: The Two Towers', year: 2002 },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { title: 'Goodfellas', year: 1990 },
  { title: 'The Matrix', year: 1999 },
  { title: 'Seven Samurai', year: 1954 },
];

test('Chip default renders', () => {
  render(<Chip text="Some Texts Here" />);
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  expect(screen.queryByText('Some Texts Here')).toBeTruthy();
});

test('Chip renders default without close button', () => {
  const { container } = render(<Chip text="Some Texts Here" />);
  const closeButton = container.querySelector('svg');
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  expect(closeButton).not.toBeTruthy();
});

test('Chip className renders correctly with color prop', () => {
  render(<Chip text="Some Texts Here" color="success" />);
  const SuccessChip = screen.getByTestId('custom-chip');

  expect(SuccessChip).toBeTruthy();
  expect(SuccessChip.className).toMatch(/makeStyles-defaultSuccess-*/);
});

test('Chip className renders correctly with extra className', () => {
  render(
    <Chip
      text="Some Texts Here"
      color="success"
      className="MuiAutocomplete-tag"
    />
  );
  const SuccessChip = screen.getByTestId('custom-chip');

  expect(SuccessChip).toBeTruthy();
  expect(SuccessChip.className).toMatch(/MuiAutocomplete-tag/);
});

test('Chip renders non-clickable by default', async () => {
  render(<Chip text="Some Texts Here" />);
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  await userEvent.click(DefaultChip);
  expect(handleClick).not.toHaveBeenCalled();
});

test('Chip renders with close button', () => {
  const { container } = render(
    <Chip text="Some Texts Here" handleDelete={handleDelete} />
  );
  const closeButton = container.querySelector('svg');
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  expect(closeButton).toBeTruthy();
});

test('Chip renders with handleDelete triggered', async () => {
  const { container } = render(
    <Chip text="Some Texts Here" handleDelete={handleDelete} />
  );
  const closeButton = container.querySelector('svg') as SVGElement;
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  expect(closeButton).toBeTruthy();
  await userEvent.click(closeButton);
  expect(handleDelete).toHaveBeenCalled();
});

test('Chip renders with handleClick triggered', async () => {
  render(<Chip text="Some Texts Here" handleClick={handleClick} />);
  const DefaultChip = screen.getByTestId('custom-chip');

  expect(DefaultChip).toBeTruthy();
  await userEvent.click(DefaultChip);
  expect(handleClick).toHaveBeenCalled();
});

test('Autocomplete with Chip should work with "<" key', async () => {
  render(
    <Autocomplete
      options={optionsData}
      multiple
      data-testid="autocomplete-with-chip"
      getOptionLabel={(option) => option.title}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="limitTags"
          placeholder="Favorites"
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const renderTagProps = { ...getTagProps({ index }) };
          return (
            <Chip
              {...renderTagProps}
              text={option.title}
              handleDelete={handleDelete}
            />
          );
        })
      }
    />
  );

  const AutocompleteRender = screen.getByTestId('autocomplete-with-chip');
  expect(AutocompleteRender).toBeTruthy();

  within(AutocompleteRender).getByLabelText('Open').click();
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(5);

  await userEvent.click(options[0]);
  expect(
    screen.queryByText('The Lord of the Rings: The Two Towers')
  ).toBeTruthy();

  const textField: HTMLInputElement = AutocompleteRender.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField).toBeTruthy();
  await userEvent.type(textField, '{arrowleft}');

  const chips = await screen.getAllByTestId('custom-chip');
  expect(chips.length).toBe(1);
  expect(chips[0]).toHaveFocus();
});
