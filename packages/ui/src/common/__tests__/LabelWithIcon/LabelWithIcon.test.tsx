import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

import LabelWithIcon from '../../LabelWithIcon';

const onClick = jest.fn();

describe('LabelWithIcon', () => {
  it('renders the component successfully', async () => {
    render(
      <LabelWithIcon
        name="first-driver-name"
        onClick={onClick}
        value=""
        icon={<>FakeIconHere</>}
        placeholder="Enter info here"
      />
    );
    const mainComponent = screen.getByTestId('first-driver-name-labelWithIcon');
    expect(mainComponent).toBeInTheDocument();
    expect(screen.getByText('Enter info here')).toBeInTheDocument();
    expect(screen.getByText('FakeIconHere')).toBeInTheDocument();

    await userEvent.click(mainComponent);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders the component successfully and displays the value correctly', async () => {
    render(
      <LabelWithIcon
        name="first-driver-name"
        onClick={onClick}
        value="Somchai Thapa"
        placeholder="Enter info here"
      />
    );
    const mainComponent = screen.getByTestId('first-driver-name-labelWithIcon');
    expect(mainComponent).toBeInTheDocument();
    expect(screen.getByText('Somchai Thapa')).toBeInTheDocument();
    expect(screen.queryByText('Enter info here')).not.toBeInTheDocument();

    await userEvent.click(mainComponent);
    expect(onClick).toHaveBeenCalled();
  });
});
