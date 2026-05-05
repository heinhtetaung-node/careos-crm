import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import InputData from './InputData';

const handleEnter = jest.fn();
const handleBlur = jest.fn();
const setValueItem = jest.fn();
const setIsEditText = jest.fn();

const mockText =
  'Q6J4x2I4Qt2MXrLRTMwaB4fgt7z9Rg8lNmmtPQyPZE50GAsO9VjDFGw8RvovjwdQgl9dlDx5rRDD0IHeJRrD2MNf0Tjdsr0HM2Hmy';

it('should InputData change value in input box', async () => {
  render(
    <InputData
      onChange={setValueItem}
      valueText="190019942021"
      isEditable
      name="policyHolderNationalId"
      isError={false}
      error=""
      maxLength={101}
      isNumeric
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
    />
  );
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), 'test value');
  expect(setValueItem).toHaveBeenCalled();
});

it('should InputData component input editable when click on button', async () => {
  render(
    <InputData
      valueText="190019942021"
      isEditable
      name="policyHolderNationalId"
      isError={false}
      isDisabled={false}
      error=""
      maxLength={101}
      isNumeric
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
      callBackEdit={setIsEditText}
      onChange={setValueItem}
    />
  );
  await user.click(screen.getByRole('button'));
  expect(setIsEditText).toHaveBeenCalled();
});

it('should InputData component renders error when type special character', async () => {
  render(
    <InputData
      valueText="190019942021"
      isEditable
      isDisabled={false}
      name="policyHolderNationalId"
      isError
      error=""
      maxLength={101}
      isNumeric
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
      onChange={setValueItem}
    />
  );
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), '!');
  await user.tab();
  expect(screen.getByText('errors.invalidID')).toBeInTheDocument();
});

it('should InputData component renders error when type more than 40 characters', async () => {
  render(
    <InputData
      valueText="190019942021"
      isEditable
      name="customerFirstName"
      isError
      error=""
      maxLength={40}
      isNumeric
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
      onChange={setValueItem}
    />
  );
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), mockText);
  await user.tab();
  expect(screen.getByText('errors.exceedCharacters')).toBeInTheDocument();
});

it('should InputData component submit value', async () => {
  render(
    <InputData
      valueText="190019942021"
      isEditable
      name="policyHolderNationalId"
      isError={false}
      isDisabled={false}
      error=""
      maxLength={101}
      isNumeric
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
    />
  );
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), 'test{enter}');
  expect(handleEnter).toHaveBeenCalled();
});

it('Should pass the companyName validation even the value has special characters.', async () => {
  render(
    <InputData
      valueText="Rabbit.inc(*%^$^%"
      isEditable
      name="companyName"
      isError={false}
      isDisabled={false}
      error=""
      maxLength={101}
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
    />
  );

  expect(screen.getByTestId('text-input-companyName')).toBeInTheDocument();
  await user.click(screen.getByRole('button'));
  const inputBox = screen.getByRole('textbox');
  expect(inputBox).toBeInTheDocument();
  await user.type(inputBox, '...{enter}');
  expect(inputBox).toHaveValue('Rabbit.inc(*%^$^%...');
  expect(handleEnter).toHaveBeenCalled();
  expect(screen.queryByText('errors.invalidData')).not.toBeInTheDocument();
});

it('Should pass the companyName validation even when value has special characters', async () => {
  render(
    <InputData
      valueText="Haaku Nama Tata.inc"
      isEditable
      name="customerPolicyAddress/0/companyName"
      isError={false}
      isDisabled={false}
      error=""
      maxLength={101}
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
    />
  );

  expect(
    screen.getByTestId('text-input-customerPolicyAddress/0/companyName')
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button'));
  const inputBox = screen.getByRole('textbox');
  expect(inputBox).toBeInTheDocument();
  await user.type(inputBox, '@rabbit{enter}');
  expect(inputBox).toHaveValue('Haaku Nama Tata.inc@rabbit');
  expect(handleEnter).toHaveBeenCalled();
  expect(screen.queryByText('errors.invalidData')).not.toBeInTheDocument();
});

it('Should pass the companyName validation even when the value has any special characters.', async () => {
  render(
    <InputData
      valueText="Haaku Nama Tata.inc"
      isEditable
      name="customerPolicyAddress/0/companyName"
      isError={false}
      isDisabled={false}
      error=""
      maxLength={101}
      className=""
      handleOnBlur={handleBlur}
      handleOnEnter={handleEnter}
    />
  );

  expect(
    screen.getByTestId('text-input-customerPolicyAddress/0/companyName')
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button'));
  const inputBox = screen.getByRole('textbox');
  expect(inputBox).toBeInTheDocument();
  await user.type(inputBox, '; Timon, Pumba{enter}');
  expect(inputBox).toHaveValue('Haaku Nama Tata.inc; Timon, Pumba');
  expect(handleEnter).toHaveBeenCalled();
  expect(screen.queryByText('errors.invalidData')).not.toBeInTheDocument();
});
