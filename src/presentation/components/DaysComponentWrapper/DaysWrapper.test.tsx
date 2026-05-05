import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DaysComponentWrapper from './DaysComponentWrapper';

const NEXT_WEEK = 'NEXT_WEEK';

const mockedOnNextPreviousHandle = jest.fn();

const initialProps = {
  isHaveToday: false,
  onNextPrevious: mockedOnNextPreviousHandle,
};

describe('<DaysComponentWrapper Component/>', () => {
  it('will be mounted correctly', () => {
    render(<DaysComponentWrapper {...initialProps} />);
  });

  it('click day navigation', async () => {
    render(<DaysComponentWrapper {...initialProps} />);
    await user.click(screen.getByTestId('right-arrow'));
    expect(mockedOnNextPreviousHandle).toHaveBeenCalledWith(NEXT_WEEK);
  });

  afterEach(() => {
    mockedOnNextPreviousHandle.mockClear();
  });
});
