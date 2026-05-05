import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PreferredType from '.';

const handleSelectChange = jest.fn();

const props = {
  value: [{ title: ['type_1'] }],
  handleSelectChange,
};

test('PreferredType Component renders', () => {
  render(<PreferredType {...props} isDisabled />);
  expect(screen.queryByText('type_1')).toBeInTheDocument();
});

test('PreferredType Component handles update', async () => {
  render(<PreferredType {...props} />);
  await userEvent.type(screen.getByRole('textbox'), 'type 2');
  const options = await screen.findAllByRole('option');

  expect(options.length).toBe(2);
});
