import user from '@testing-library/user-event';
import React from 'react';

import { render } from '__tests__/rtl-test-utils';
import { dayComponent } from 'models/DayComponent';

import DayComponent from './DayComponent';

const mockedOnSelectHandle = jest.fn();

const dayData: dayComponent = {
  appointmentCalls: 3,
  date: '2020-10-12',
  freeSlots: 195,
  isActive: true,
  paymentCalls: 2,
};

const initialProps = {
  data: dayData,
  isLoading: false,
  isDisabled: false,
  onSelect: mockedOnSelectHandle,
};

describe('<DayComponent Component/>', () => {
  it('will be mounted correctly', () => {
    render(<DayComponent {...initialProps} />);
  });

  it('check day component exists', () => {
    const { container } = render(<DayComponent {...initialProps} />);
    expect(
      container.querySelector('.unittest-day-component-exists')
    ).not.toBeNull();
  });

  it('on select handle', async () => {
    const { container } = render(<DayComponent {...initialProps} />);
    await user.click(
      container.querySelector('.unittest-app-day-component') as Element
    );
    expect(mockedOnSelectHandle).toHaveBeenCalledWith(dayData);
  });
});
