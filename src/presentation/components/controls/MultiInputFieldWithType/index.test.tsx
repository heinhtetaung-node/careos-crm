import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { OptionProps } from '../Select';

import MultiInputFieldWithType from '.';

const options = [
  {
    type: 'text' as OptionProps['type'],
    name: 'phone',
    title: 'phone',
    placeholder: 'enter phone',
  },
  {
    type: 'text' as OptionProps['type'],
    name: 'name',
    title: 'name',
    placeholder: 'enter name',
  },
];

describe('Testing MultiInputFeidlWithType Component with defined limit', () => {
  beforeEach(() => {
    render(
      <MultiInputFieldWithType
        label="phone"
        name="phone"
        limit={3}
        value={[]}
        options={options}
        onChange={jest.fn}
        dataTestid="input-test-id"
      />
    );
    expect(
      screen.getByTestId('multiIinput-field-container')
    ).toBeInTheDocument();
  });
  it('should not be able to create inputs', async () => {
    const addBtn = screen.getByTestId('add-input-btn');

    expect(addBtn).toBeInTheDocument();

    await userEvent.click(addBtn);
    await userEvent.click(addBtn);

    const removeBtn = screen.getAllByTestId('remove-input-btn');

    expect(removeBtn.length).toBe(2);
  });
  it('should be able to remove the input if clicks on remove btn', async () => {
    const addBtn = screen.getByTestId('add-input-btn');

    await userEvent.click(addBtn);

    const removeBtn = screen.getAllByTestId('remove-input-btn');
    expect(removeBtn.length).toBe(2);

    await userEvent.click(removeBtn[0]);
    await userEvent.click(removeBtn[1]);

    expect(screen.getAllByTestId('input-test-id').length).toBe(1);
  });
  it('should not be able to create more inputs than defined limit', async () => {
    const addBtn = screen.getByTestId('add-input-btn');

    await userEvent.click(addBtn);
    await userEvent.click(addBtn);

    await userEvent.type(screen.getAllByTestId('input-test-id')[0], 'asd');

    expect(screen.getAllByTestId('input-test-id').length).toBe(2);
    expect(addBtn).not.toBeInTheDocument();
  });
});
