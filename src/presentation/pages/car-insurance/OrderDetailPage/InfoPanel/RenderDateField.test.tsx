import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { differenceInYears } from 'utils/datetime';

import { getBirthDateError, getDateError, getDateObj } from './helper';
import RenderDateField, { getAge } from './RenderDateField';

const handleUpdateOrder = jest.fn();

afterEach(cleanup);
const props = {
  value: new Date('1990-06-01'),
  name: 'firstDriverDOB',
  onUpdateOrder: handleUpdateOrder,
  dateType: 'birthdate',
  isEditable: true,
};

xtest('RenderDateField Component mounts and renders correct date format', () => {
  const { getByTestId } = render(<RenderDateField {...props} />);
  expect(getByTestId('date-input-field')).toBeTruthy();
});

// TODO: MUI controlled input needs a different way to be test
test.skip('RenderDateField Component handles date change and validates', async () => {
  const props1 = {
    ...props,
    value: new Date('2023-10-10'),
  };
  const { getByTestId, rerender, getByText } = render(
    <RenderDateField {...props} />
  );
  const input = getByTestId('date-input-textfield') as HTMLInputElement;
  await userEvent.type(input, '10/10/2023');
  await userEvent.tab();

  rerender(<RenderDateField {...props1} />);
  await waitFor(() => expect(getByText('10/10/2023')).toBeInTheDocument());
});

describe('Test getBirthDateError', () => {
  it('Should return underage error msg if age less than 18', () => {
    expect(getBirthDateError(10)).toEqual('errors.invalidAgeUnder');
  });
  it('Should return overrage error msg if age more than 100', () => {
    expect(getBirthDateError(101)).toEqual('errors.invalidAgeOver');
  });
  it('Should return invalid value message if age is not a number', () => {
    expect(getBirthDateError(NaN)).toEqual('errors.invalidValue');
  });
});

describe('Test getDateError', () => {
  it('Should return invalid value message', () => {
    expect(getDateError()).toEqual('errors.invalidValue');
  });
});

describe('Test getDateObj', () => {
  it('Should return js date object if valid date', () => {
    expect(getDateObj('10/10/2020')).toEqual(new Date('10/10/2020'));
  });

  it('Should return error if invalid date', () => {
    expect(getDateObj('13/20/2020')).toEqual('Invalid Date');
  });
});

describe('getAge', () => {
  it('returns the age', () => {
    const result = getAge('12/23/1990');
    expect(result).toEqual(
      differenceInYears(new Date(), new Date('12/23/1990'))
    );
  });

  it('returns empty string if passed date is in wrong format', () => {
    const result = getAge('23/12/1990');
    expect(result).toEqual(0);
  });
});
