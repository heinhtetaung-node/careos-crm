import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DayCard from '../DayCard';

describe('DayCard', () => {
  it('should show values provided in prop', () => {
    render(
      <DayCard
        id="1"
        day="Monday"
        date="10/10/2022"
        free={1}
        appointment={1}
        paymentCall={1}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByTestId('daycard-1')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('(10/10/2022)')).toBeInTheDocument();
  });

  it('should call click fn when clicked', async () => {
    const mockClickFn = jest.fn();
    render(
      <DayCard
        id="1"
        day="Monday"
        date="10/10/2022"
        free={1}
        appointment={1}
        paymentCall={1}
        onClick={mockClickFn}
      />
    );
    await userEvent.click(screen.getByTestId('daycard-1'));
    expect(mockClickFn).toHaveBeenCalled();
  });

  it('should not call if the card is disabled', async () => {
    const mockClickFn = jest.fn();
    render(
      <DayCard
        id="1"
        day="Monday"
        date="10/10/2022"
        free={1}
        appointment={1}
        paymentCall={1}
        onClick={mockClickFn}
        disabled
      />
    );
    await userEvent.click(screen.getByTestId('daycard-1'));
    expect(mockClickFn).not.toHaveBeenCalled();
  });

  it('should display loading animator', () => {
    render(<DayCard id="1" loading />);
    expect(screen.getByTestId('card-loading')).toBeInTheDocument();
  });
});
