import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import TabSection from '.';

test('TabSection renders', () => {
  const props = {
    tabs: [
      {
        title: 'Test',
        component: <p>Content</p>,
      },
    ],
  };
  render(<TabSection {...props} />);
  expect(screen.getByRole('tab', { name: 'Test' })).toBeInTheDocument();
  expect(screen.getByRole('tabpanel')).toBeInTheDocument();
});

test('TabSection handle tab change', async () => {
  const props = {
    tabs: [
      {
        title: 'Test1',
        component: <p>Content1</p>,
        label: 'Policy issued',
      },
      {
        title: 'Test2',
        component: <p>Content2</p>,
      },
    ],
  };
  render(<TabSection {...props} />);
  const test1Tab = screen.getByRole('tab', { name: 'Test1' });
  const test2Tab = screen.getByRole('tab', { name: 'Test2' });
  await userEvent.click(test2Tab);
  expect(test2Tab).toHaveFocus();
  expect(test1Tab).not.toHaveFocus();
});
