import React from 'react';
import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RadioGroup from '../RadioGroup';
import Radio from '../RadioGroup/Radio';

test('should render RadioGroup component with vertical orientation', async () => {
  const onChangeFn = jest.fn();
  render(
    <RadioGroup
      dataTestId="radiogroup-test"
      isDisabled={false}
      value="male"
      field="gender"
      options={[
        {
          label: 'Male',
          name: 'male',
          value: 'male',
        },
        {
          label: 'Female',
          name: 'female',
          value: 'female',
        },
        {
          label: "Don't want to say",
          name: 'others',
          value: 'others',
        },
      ]}
      orientation="vertical"
      radioType="tick"
      onChange={onChangeFn}
    />
  );
  const checkBoxOption = screen.getByTestId('radiogroup-test');
  expect(checkBoxOption).toBeInTheDocument();
  expect(checkBoxOption).toHaveClass('flex flex-col items-start');

  const optionMale = screen.getByTestId('radio-gender-male');
  expect(optionMale).toBeChecked();

  const optionFemale = screen.getByTestId('radio-gender-female');
  await user.click(optionFemale);
  expect(onChangeFn).toHaveBeenCalled();
});

test('should render RadioGroup component with horizontal orientation', async () => {
  const onChangeFn = jest.fn();
  render(
    <RadioGroup
      dataTestId="radiogroup-test"
      value="male"
      field="gender"
      options={[
        {
          label: 'Male',
          name: 'male',
          value: 'male',
        },
        {
          label: 'Female',
          name: 'female',
          value: 'female',
        },
        {
          label: "Don't want to say",
          name: 'others',
          value: 'others',
        },
      ]}
      onChange={onChangeFn}
    />
  );
  const checkBoxOption = screen.getByTestId('radiogroup-test');
  expect(checkBoxOption).toBeInTheDocument();
  expect(checkBoxOption).toHaveClass('flex items-center');

  const optionMale = screen.getByTestId('radio-gender-male');
  expect(optionMale).toBeChecked();

  const optionFemale = screen.getByTestId('radio-gender-female');
  await user.click(optionFemale);
  expect(onChangeFn).toHaveBeenCalled();
});

test('should render Radio component', async () => {
  const onChangeFn = jest.fn();
  render(<Radio name="male" onChange={onChangeFn} value="male" />);
  const optionMale = screen.getByTestId('radio-male-male');
  expect(optionMale).not.toBeChecked();
  await user.click(optionMale);
  expect(onChangeFn).toHaveBeenCalled();
});
