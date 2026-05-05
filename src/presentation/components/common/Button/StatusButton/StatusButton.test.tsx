import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import StatusButton from '.';

const handleClick = jest.fn();

test('StatusButton renders', () => {
  render(
    <StatusButton
      isDisabled
      text="Warning"
      variant="contained"
      color="error"
      statusType="warning"
      handleClick={handleClick}
    />
  );
  expect(screen.queryByText('Warning')).toBeTruthy();
});

test('StatusButton renders with correct classname', () => {
  render(
    <StatusButton
      isDisabled
      text="Update Status"
      variant="contained"
      color="success"
      statusType="positive"
      handleClick={handleClick}
    />
  );
  const button = screen.getByTestId('status-button');
  expect(button).toBeTruthy();
  expect(button).toHaveClass(
    'MuiButton-contained makeStyles-containedSuccess-17 Mui-disabled Mui-disabled',
    { exact: false }
  );
});

test('StatusButton handles click', async () => {
  render(
    <StatusButton
      text="Submission Problem"
      variant="outlined"
      color="primary"
      statusType="negative"
      handleClick={handleClick}
    />
  );
  const button = screen.getByRole('button', { name: 'Submission Problem' });
  await userEvent.click(button);
  expect(handleClick).toHaveBeenCalled();
});
