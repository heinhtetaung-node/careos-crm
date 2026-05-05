import NotificationsIcon from '@material-ui/icons/Notifications';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import Menu from './Menu';

const defaultConfig = [
  {
    id: 0,
    text: 'Lorem ipsum',
  },
  {
    id: 1,
    text: 'Lorem ipsum 2',
  },
  {
    id: 2,
    text: 'Lorem ipsum 3',
    isDisabled: true,
  },
];

const labelConfig = [
  {
    id: 0,
    text: 'Lorem ipsum',
    label: 'verified',
    labelColor: 'success',
  },
  {
    id: 1,
    text: 'Lorem ipsum with label',
    label: 'unverified',
  },
  {
    id: 2,
    text: 'Lorem ipsum label',
    label: 'unverified',
    isDisabled: true,
  },
];

const checkboxConfig = [
  {
    id: 0,
    text: 'Lorem ipsum',
  },
  {
    id: 1,
    text: 'Lorem ipsum with checkbox',
  },
  {
    id: 2,
    text: 'Lorem ipsum22',
    isDisabled: true,
  },
];

const iconConfig = [
  {
    id: 0,
    text: 'Lorem ipsum icon',
    icon: <NotificationsIcon />,
    isDisabled: true,
  },
  {
    id: 1,
    text: 'Lorem ipsum',
    icon: <NotificationsIcon />,
  },
  {
    id: 2,
    text: 'Lorem ipsum xxx',
    icon: <NotificationsIcon />,
  },
];

describe('Menu renders - ', () => {
  test('with no menu item', async () => {
    render(<Menu btnText="Click Here" type="default" options={[]} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });
  test('with default menu item', async () => {
    render(
      <Menu btnText="Click Here" type="default" options={defaultConfig} />
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(3);
  });
  test('with checkbox menu item', async () => {
    render(
      <Menu btnText="Click Here" type="checkbox" options={checkboxConfig} />
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(3);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(3);
  });
  test('with menu item with icon', async () => {
    render(<Menu btnText="Click Here" type="icon" options={iconConfig} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(3);
  });
  test('with menu item with label', async () => {
    render(<Menu btnText="Click Here" type="label" options={labelConfig} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(3);
    expect(screen.queryAllByTestId('custom-chip')).toHaveLength(3);
  });
});

describe('Menu handles select item - ', () => {
  test('with default menu item', async () => {
    render(
      <Menu btnText="Click Here" type="default" options={defaultConfig} />
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const option = screen.getByRole('menuitem', { name: 'Lorem ipsum' });
    await userEvent.click(option);
    await waitFor(() => {
      expect(option).toHaveClass('Mui-selected', { exact: false });
    });
  });
  test('with checkbox menu item', async () => {
    render(
      <Menu btnText="Click Here" type="checkbox" options={checkboxConfig} />
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const option = screen.getByRole('menuitem', { name: 'Lorem ipsum' });
    await userEvent.click(option);
    await waitFor(() => {
      expect(option).toHaveClass('Mui-selected', { exact: false });
    });
  });
  test('with menu item with icon', async () => {
    render(<Menu btnText="Click Here" type="icon" options={iconConfig} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const option = screen.getByRole('menuitem', { name: 'Lorem ipsum' });
    await userEvent.click(option);
    await waitFor(() => {
      expect(option).toHaveClass('Mui-selected', { exact: false });
    });
  });
  test('with menu item with label', async () => {
    render(<Menu btnText="Click Here" type="label" options={labelConfig} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const option = screen.getByRole('menuitem', {
      name: 'Lorem ipsum verified',
    });
    await userEvent.click(option);
    await waitFor(() => {
      expect(option).toHaveClass('Mui-selected', { exact: false });
    });
  });
  test('nothing selectable for disabled item', async () => {
    render(<Menu btnText="Click Here" type="label" options={labelConfig} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    const option = screen.getByRole('menuitem', {
      name: 'Lorem ipsum label unverified',
    });
    expect(option).toHaveClass('Mui-disabled', { exact: false });
  });
});
