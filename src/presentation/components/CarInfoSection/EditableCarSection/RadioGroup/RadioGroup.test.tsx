import { render, screen } from '@testing-library/react';
import * as React from 'react';

import RadioGroup from '.';

const handleChange = jest.fn();

const config = {
  name: 'carDashCam',
  title: 'Dashcam',
  dataTestId: 'dashcam-radio-group',
  showAsterisk: true,
  row: true,
  showLabel: true,
  isReadOnly: false,
  error: false,
  isDisabled: true,
  options: [
    {
      id: 0,
      val: true,
      title: 'Yes',
    },
    {
      id: 1,
      val: false,
      title: 'No',
    },
  ],
  value: 'true',
  handleChange,
};

it('Render RadioGroup', () => {
  render(<RadioGroup {...config} row />);
  expect(screen.getByTestId('dashcam-radio-group')).toBeInTheDocument();
  expect(screen.getByText('Dashcam')).toBeVisible();
  expect(screen.getByText('*')).toBeVisible();
  expect(screen.getAllByRole('radio').length).toEqual(2);
});

it('Render read-only RadioGroup', () => {
  render(<RadioGroup {...config} isReadOnly />);
  expect(screen.queryByText('true')).toBeInTheDocument();
  expect(screen.queryAllByRole('radio').length).toEqual(0);
});

it('renders radioField even when oprions is not passed', () => {
  const newConfig = {
    name: 'carDashCam',
    title: 'Dashcam',
    error: false,
    value: undefined,
  };

  render(<RadioGroup {...newConfig} />);
  expect(screen.queryAllByRole('radio').length).toEqual(0);
});
