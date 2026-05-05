import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import RadioGroupField from './index';

const handleChange = jest.fn();

const config = {
  name: 'insuranceType',
  title: 'text.insuranceType',
  dataTestId: 'formik-text-field-input-1',
  options: [
    {
      id: 0,
      val: 'type-1',
      title: 'insuranceTypes.type1',
    },
    {
      id: 1,
      val: 'type-2',
      title: 'insuranceTypes.type2',
    },
  ],
  handleChange,
};

it('Render RadioGroupField', () => {
  render(<RadioGroupField {...config} row />);
  expect(screen.getByText('text.insuranceType')).toBeVisible();
  expect(screen.getAllByRole('radio').length).toEqual(2);
});

it('Render read-only RadioGroupField', () => {
  render(<RadioGroupField {...config} value="Yes" isReadOnly />);
  expect(screen.queryAllByRole('radio').length).toEqual(2);
});

it('Render RadioGroupField with no options, dataTestId, title and name', () => {
  render(
    <RadioGroupField name="gender" title="" handleChange={handleChange} />
  );
  expect(screen.queryAllByRole('radio').length).toEqual(0);
});

it('Handle RadioGroupField select option', async () => {
  render(<RadioGroupField {...config} />);
  const option1 = screen.getByRole('radio', { name: 'insuranceTypes.type1' });
  const option2 = screen.getByRole('radio', { name: 'insuranceTypes.type2' });
  await userEvent.click(option2);
  await waitFor(() => {
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });
});
