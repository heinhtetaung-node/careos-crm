import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RemovableItem from './RemovableItem';

const handleRemove = jest.fn();
const props = {
  label: 'Label',
  value: 5000,
  handleRemove,
};

test('RemovableItem render with label and value', () => {
  render(<RemovableItem {...props} dataTestId="test" />);
  expect(screen.getByTestId('test')).toBeTruthy();
  expect(screen.queryByText('Label')).toBeInTheDocument();
  expect(screen.queryByText(5000)).toBeInTheDocument();
});

test('RemovableItem click on icon to remove item', async () => {
  render(<RemovableItem {...props} />);
  const removeBtn = screen.getByRole('button');
  await userEvent.click(removeBtn);
  await waitFor(() => {
    expect(handleRemove).toHaveBeenCalledWith('Label');
  });
});
