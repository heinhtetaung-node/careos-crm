import NotificationsIcon from '@material-ui/icons/Notifications';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import Select from '.';

const defaultOptions = [
  {
    id: 0,
    text: 'Lorem ipsum',
    value: 'lorem ipsum',
  },
  {
    id: 1,
    text: 'Lorem ipsum 2',
    value: 'lorem ipsum 2',
  },
  {
    id: 2,
    text: 'Lorem ipsum 3',
    value: 'lorem ipsum 3',
    isDisabled: true,
  },
];

const labelMenuOptions = [
  {
    id: 0,
    text: 'Lorem ipsum 1',
    value: 'lorem ipsum 1',
    label: 'verified',
    labelColor: 'success',
  },
  {
    id: 1,
    text: 'Lorem ipsum 2',
    value: 'lorem ipsum 2',
    label: 'unverified',
  },
  {
    id: 2,
    text: 'Lorem ipsum 3',
    value: 'lorem ipsum',
    label: 'unverified',
    isDisabled: true,
  },
];

const iconMenuOptions = [
  {
    id: 0,
    text: 'Lorem ipsum 111',
    value: 'lorem ipsum 111',
    icon: <NotificationsIcon />,
    isDisabled: true,
  },
  {
    id: 1,
    text: 'Lorem ipsum 1',
    value: 'lorem ipsum 1',
    icon: <NotificationsIcon />,
  },
  {
    id: 2,
    text: 'Lorem ipsum xxx',
    value: 'lorem ipsum xxx',
    icon: <NotificationsIcon />,
  },
];

describe('Test <Select/>', () => {
  const handleSelect = jest.fn();
  afterEach(() => {
    handleSelect.mockClear();
  });
  it('Test <Select/> component render successfully', async () => {
    render(
      <Select
        type="default"
        label="Select"
        options={defaultOptions}
        handleDataSelect={handleSelect}
      />
    );

    const input = screen.getByRole('button', { name: defaultOptions[0].text });
    await userEvent.click(input);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('Test <Select/> call callback when user make selection', async () => {
    render(
      <Select
        type="default"
        label="Select"
        options={defaultOptions}
        handleDataSelect={handleSelect}
      />
    );

    let input = screen.getByRole('button', { name: defaultOptions[0].text });
    await userEvent.click(input);
    const options = screen.getAllByRole('option');

    await userEvent.click(options[1]);
    input = screen.getByRole('button', { name: defaultOptions[1].text });
    expect(input).toBeInTheDocument();
    expect(handleSelect).toHaveBeenCalledWith(defaultOptions[1].value);
  });

  it('Test <Select/> with checkbox type menu ', async () => {
    render(
      <Select
        type="checkbox"
        label="Select"
        options={defaultOptions}
        handleDataSelect={handleSelect}
      />
    );

    const input = screen.getByRole('button', { name: defaultOptions[0].text });
    await userEvent.click(input);

    expect(screen.getByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  it('Test <Select/> with label type menu ', async () => {
    render(
      <Select
        type="label"
        label="Select"
        options={labelMenuOptions}
        handleDataSelect={handleSelect}
      />
    );

    const input = screen.getByRole('button', {
      name: labelMenuOptions[0].text,
    });
    await userEvent.click(input);

    const chips = screen.getAllByTestId('custom-chip');

    expect(chips).toHaveLength(3);
  });

  it('Test <Select/> with icon type menu', async () => {
    render(
      <Select
        type="icon"
        label="Select"
        options={iconMenuOptions}
        handleDataSelect={handleSelect}
      />
    );

    const input = screen.getByRole('button', { name: iconMenuOptions[0].text });
    await userEvent.click(input);
    const menu = screen.getByRole('presentation');

    const icons = menu.querySelectorAll('.MuiSvgIcon-root');

    expect(icons).toHaveLength(3);
  });

  it('Test <Select/> should update selected value if current index is updated', async () => {
    const currentIndex = 2;
    render(
      <Select
        type="icon"
        label="Select"
        currentIndex={currentIndex}
        options={iconMenuOptions}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(iconMenuOptions[currentIndex].text)
      ).toBeInTheDocument()
    );
  });
});
