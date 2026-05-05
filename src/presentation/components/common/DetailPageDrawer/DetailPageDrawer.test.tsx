import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DetailPageDrawer from '.';

const nav = {
  intro: {
    label: 'Introduction',
  },
  ending: {
    label: 'Ending',
  },
};
test('DetailPageDrawer render', () => {
  render(
    <DetailPageDrawer nav={nav} tab="ending">
      Content
    </DetailPageDrawer>
  );
  expect(screen.getByTestId('detail-page')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
});

test('DetailPageDrawer handle select', async () => {
  render(
    <DetailPageDrawer nav={nav} badges={{ introduction: ['a', 'b'] }}>
      Content
    </DetailPageDrawer>
  );
  const tab = screen.getByRole('button', { name: 'Ending -' });
  await userEvent.click(tab);
  expect(tab).toHaveClass(
    'MuiButtonBase-root MuiListItem-root MuiListItem-gutters MuiListItem-button',
    { exact: false }
  );
});
