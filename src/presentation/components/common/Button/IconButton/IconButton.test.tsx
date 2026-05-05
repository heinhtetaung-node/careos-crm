import NotificationsIcon from '@material-ui/icons/Notifications';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import IconButton from './IconButton';

const handleClick = jest.fn();

test('IconButton renders', () => {
  render(
    <IconButton
      color="primary"
      iconSize="s"
      btnSize="large"
      handleClick={handleClick}
      icon={<NotificationsIcon />}
    />
  );
  const button = screen.getByRole('button');
  expect(button).toBeTruthy();
  expect(button).toHaveClass('makeStyles-sIconBtnLarge-7', { exact: false });
});

test('IconButton renders with default sizes ', () => {
  render(<IconButton handleClick={handleClick} icon={<NotificationsIcon />} />);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('makeStyles-mIconBtnMedium-16', { exact: false });
});

test('IconButton handles click', async () => {
  render(
    <IconButton
      color="secondary"
      iconSize="xl"
      btnSize="large"
      handleClick={handleClick}
      icon={<NotificationsIcon />}
    />
  );
  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
