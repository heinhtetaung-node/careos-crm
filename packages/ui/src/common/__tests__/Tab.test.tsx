import React from 'react';
import { NewBellIcon } from '@alphafounders/icons';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Tab from '../Tab';

const tabsData = [
  { id: 1, title: 'Tab 1' },
  { id: 2, title: 'Tab 2' },
  { id: 3, title: 'Tab 3' },
];

test('should render tab contained', () => {
  render(
    <Tab tabs={tabsData}>
      <p>Tab 1</p>
    </Tab>
  );

  const tabContent = screen.getByTestId('tab-content');
  expect(screen.getByTestId('tab-contained-header')).toBeInTheDocument();
  expect(screen.getByTestId('tab-content')).toBeInTheDocument();
  expect(within(tabContent).getByText('Tab 1')).toBeInTheDocument();
});

test('should render tab underline', () => {
  render(<Tab tabs={tabsData} variant="underline" />);

  expect(screen.getByTestId('tab-underline-header')).toBeInTheDocument();
});

test('should render tab with icon and badge', () => {
  const tabsDataWithIconAndBadge = [
    {
      id: 1,
      title: 'Tab 1',
      icon: <NewBellIcon />,
      badge: 10,
    },
    ...tabsData.slice(1),
  ];
  render(<Tab tabs={tabsDataWithIconAndBadge} />);

  expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
  expect(screen.getByTestId('tab-badge')).toBeInTheDocument();
});

test('should render tab with custom active tab', () => {
  render(
    <Tab tabs={tabsData} tabToActive={3}>
      <p>Tab 3</p>
    </Tab>
  );

  expect(
    within(screen.getByTestId('tab-content')).getByText('Tab 3')
  ).toBeInTheDocument();
});

test('should tab onChange triggered', async () => {
  const onTabChange = jest.fn();
  render(<Tab tabs={tabsData} onTabChange={onTabChange} />);
  const tabs = screen.getAllByRole('button');

  await userEvent.click(tabs[1]);
  expect(onTabChange).toBeCalled();
});
