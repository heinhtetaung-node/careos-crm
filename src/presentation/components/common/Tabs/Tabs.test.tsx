import DateRangeSharpIcon from '@material-ui/icons/DateRangeSharp';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import Tabs from '.';

function MockComponent() {
  return <div>Simple example component</div>;
}

const tabsData = [
  {
    label: `Leads`,
    content: 'Tab leads content',
  },
  {
    label: 'Orders',
    content: 'Order tab content',
    disabled: true,
  },
  {
    label: 'Starred',
    icon: <DateRangeSharpIcon />,
    content: 'Starred tab content',
    selected: true,
  },
  {
    label: 'Voice records',
    errors: '5',
    content: <MockComponent />,
  },
  {
    label: 'Profile',
    icon: <DateRangeSharpIcon />,
    tags: '1/2',
    content: 'Profile tab content',
  },
];

test('Should render tabs by default with tab content', () => {
  render(<Tabs tabsData={tabsData} />);
  const DefaultTabs = screen.getByTestId('custom-tabs');

  expect(DefaultTabs).toBeTruthy();
  expect(screen.queryByText('Starred tab content')).toBeTruthy();
});

test('Should second tab item disabled', async () => {
  render(<Tabs tabsData={tabsData} />);
  const tabs = await screen.findAllByRole('tab');

  expect(tabs[1]).toHaveAttribute('aria-disabled', 'true');
});

test('Should tab change', async () => {
  render(<Tabs tabsData={tabsData} />);
  const tabs = await screen.findAllByRole('tab');
  await userEvent.click(tabs[tabs.length - 1]);

  expect(screen.queryByText('Profile tab content')).toBeTruthy();
});

test('Should third tab auto selected with tab icon', async () => {
  render(<Tabs tabsData={tabsData} />);
  const tabs = await screen.findAllByRole('tab');

  expect(within(tabs[2]).queryAllByRole('svg')).toBeTruthy();
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
});

test('Should the forth tab show an error badge with tab content is a component', async () => {
  render(<Tabs tabsData={tabsData} />);
  const tabs = await screen.findAllByRole('tab');
  await userEvent.click(tabs[3]);

  expect(tabs[3].firstChild).toHaveClass('MuiBadge-root');
  expect(screen.queryByText('Simple example component')).toBeTruthy();
});

test('Should fifth tab has tags', async () => {
  render(<Tabs tabsData={tabsData} />);
  const tabs = await screen.findAllByRole('tab');

  expect(tabs[4].firstChild).toHaveClass('hasTags');
});
