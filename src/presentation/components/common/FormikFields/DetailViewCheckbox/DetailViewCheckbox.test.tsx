import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import DetailViewCheckbox from './index';

const handleUpdate = jest.fn();

describe('DetailViewCheckbox component', () => {
  const config = {
    title: 'Label',
    name: 'Lorem Ipsum',
    indeterminate: false,
    handleUpdate,
  };
  it('renders', () => {
    render(<DetailViewCheckbox {...config} checked isDisabled />);
    expect(screen.getByText('Lorem Ipsum')).toBeVisible();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  it('renders readonly', () => {
    render(<DetailViewCheckbox {...config} checked isReadOnly />);
    expect(screen.getByText('Lorem Ipsum')).toBeVisible();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('handles checking', async () => {
    render(<DetailViewCheckbox {...config} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Lorem Ipsum' });
    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
});
