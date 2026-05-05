import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import StarButton from './StarButton';

describe('StarButton renders', () => {
  test('StarButton renders unselected', () => {
    render(<StarButton />);
    expect(screen.queryByTestId('unselected-star')).toBeTruthy();
  });
  test('StarButton renders selected', () => {
    render(<StarButton selected />);
    expect(screen.queryByTestId('selected-star')).toBeTruthy();
  });
  test('StarButton renders disabled', () => {
    render(<StarButton disabled />);
    expect(screen.queryByTestId('disabled-star')).toBeInTheDocument();
  });
});

describe('StarButton handles click', () => {
  test('change state from unselected to selected', async () => {
    render(<StarButton />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.queryByTestId('selected-star')).toBeTruthy();
  });
  test('change state from selected to unselected', async () => {
    render(<StarButton selected />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.queryByTestId('unselected-star')).toBeTruthy();
  });
});
