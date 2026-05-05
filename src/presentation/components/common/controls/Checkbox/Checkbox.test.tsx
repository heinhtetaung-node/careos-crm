import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Checkbox from './index';

const handleUpdate = jest.fn();

describe('Checkbox component', () => {
  const config = {
    name: 'Lorem Ipsum',
    handleUpdate,
  };
  it('renders', () => {
    render(<Checkbox {...config} isDisabled />);
    expect(screen.getByText('Lorem Ipsum')).toBeVisible();
    expect(screen.getAllByRole('checkbox').length).toEqual(1);
  });

  it('renders indeterminate', () => {
    render(<Checkbox {...config} indeterminate isDisabled />);
    expect(screen.getByText('Lorem Ipsum')).toBeVisible();
    expect(screen.getAllByRole('checkbox').length).toEqual(1);
  });

  it('handles checking', async () => {
    render(<Checkbox {...config} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Lorem Ipsum' });
    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
});
