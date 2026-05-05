import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import DropdownButton from '../../Buttons/DropdownButton';

describe('DropdownButton component', () => {
  it('should render with no options', () => {
    render(<DropdownButton text="demo dropdown" />);

    expect(screen.getByTestId('dropdownButton')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0].textContent).toBe('demo dropdown');
    expect(screen.getByTestId('noData')).toBeInTheDocument();
  });
  it('should render with no options and text', () => {
    render(<DropdownButton text="" />);

    expect(screen.getByTestId('dropdownButton')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0].textContent).toBe('select');
    expect(screen.getByTestId('noData')).toBeInTheDocument();
  });
  it('should render with options', () => {
    render(
      <DropdownButton
        text="demo dropdown"
        options={[
          {
            id: '1',
            name: 'list 1',
          },
        ]}
      />
    );

    expect(screen.getByTestId('dropdownButton')).toBeInTheDocument();
    expect(screen.getAllByTestId('dropdownButtonList').length).toBe(1);
  });
});
