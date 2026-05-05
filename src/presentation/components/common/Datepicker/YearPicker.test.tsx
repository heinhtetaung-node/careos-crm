import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import YearPicker from './YearPicker';

const handdleYearChange = jest.fn((year) => year);

describe('Date of birth year picker module', () => {
  it('Should render default year picker', () => {
    render(<YearPicker handlerClick={handdleYearChange} />);
    const yearButtons = screen.getAllByRole('button');
    expect(yearButtons.length - 1).toBe(100);
  });

  it('Should render with minYear/maxYear', () => {
    render(
      <YearPicker
        minYear={1910}
        maxYear={2022}
        handlerClick={handdleYearChange}
      />
    );
    const yearButtons = screen.getAllByRole('button');
    expect(yearButtons[0].innerHTML).toBe('1910');
    expect(yearButtons[yearButtons.length - 1].innerHTML).toBe('2022');
  });

  it('Should call handlerClick when click to year', async () => {
    render(
      <YearPicker
        minYear={1910}
        maxYear={2022}
        handlerClick={handdleYearChange}
      />
    );
    const yearButtons = screen.getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    expect(handdleYearChange.mock.results[0].value).toBeTruthy();
    expect(handdleYearChange.mock.results[0].value.toString()).toMatch(/1910/);
  });
});
