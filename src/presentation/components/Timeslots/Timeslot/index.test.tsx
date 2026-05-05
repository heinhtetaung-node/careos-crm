import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import Timeslot from './index';

describe('Timeslot', () => {
  it('should show selector if showTimeSelection is true', async () => {
    render(
      <Timeslot
        data={{ time: '09:00' }}
        slots={[1, 2, 3]}
        showTimeSelection
        onSelectSlot={jest.fn()}
        showAppointmentDetail={jest.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('09:00'));
    expect(screen.getByTestId('callduraction-list-09:00')).toHaveClass('show');
  });

  it('should not show selector if showTimeSelection is false', async () => {
    render(
      <Timeslot
        data={{ time: '09:00' }}
        slots={[1, 2, 3]}
        onSelectSlot={jest.fn()}
        showAppointmentDetail={jest.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('09:00'));
    expect(screen.getByTestId('callduraction-list-09:00')).not.toHaveClass(
      'show'
    );
  });
});
