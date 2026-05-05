import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DaysComponent from './DaysComponent';

const fakeAction = 'NEXT_WEEK';

const mockedOnChangeHandle = jest.fn();
const mockedOnSelectHandle = jest.fn();

const initialProps = {
  numberOfDays: 0,
  daysDataArray: [],
  selectedDate: '',
  isLoading: false,
  onSelect: mockedOnSelectHandle,
  onChange: mockedOnChangeHandle,
};

describe('<DaysComponent Component/>', () => {
  it('will be mounted correctly', () => {
    render(<DaysComponent {...initialProps} />);
  });

  it('change date slide', async () => {
    render(<DaysComponent {...initialProps} />);
    await user.click(screen.getByTestId('right-arrow'));
    expect(mockedOnChangeHandle).toHaveBeenCalledWith(fakeAction);
  });
});
