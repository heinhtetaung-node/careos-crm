import React from 'react';
import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkbox from '../Checkbox';

test('should render normal size checkbox', async () => {
  const onChangeFn = jest.fn();
  render(
    <Checkbox
      dataTestId="checkbox-test"
      label="Normal test label"
      onChange={onChangeFn}
    />
  );
  const checkBoxOption = screen.getByTestId('checkbox-test');
  expect(checkBoxOption).toBeInTheDocument();
  await user.click(checkBoxOption);
  expect(onChangeFn).toHaveBeenCalled();
});

test('should render disabled large size checkbox without label', async () => {
  const onChangeFn = jest.fn();
  render(
    <Checkbox
      dataTestId="disabled-checkbox-test"
      checked
      disabled
      checkboxSize="large"
      onChange={onChangeFn}
    />
  );
  const checkBoxOption = screen.getByTestId('disabled-checkbox-test');
  expect(checkBoxOption).toBeInTheDocument();
  expect(checkBoxOption).toBeDisabled();
  await user.click(checkBoxOption);
  expect(onChangeFn).not.toHaveBeenCalled();
});
