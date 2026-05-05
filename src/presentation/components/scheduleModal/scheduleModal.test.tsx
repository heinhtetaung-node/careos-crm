import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { getString } from '../../theme/localization';
import LeadScheduleModalHelper from '../modal/LeadScheduleModal/LeadScheduleModal.helper';

import ScheduleModal from './index';

// jest.mock('../modal/LeadScheduleModal/LeadScheduleModal.helper');

const handleCloseModal = jest.fn();

const initialProps = {
  openDialog: true,
  appointmentOptions: () => [
    { id: 'requested', title: getString('text.customerRequested') },
  ],
  onSubmit: () => jest.fn(),
  onGetAppointment: () => jest.fn(),
  onGetAppointmentDetail: () => jest.fn(),
  loading: false,
  HelperScheduleData: LeadScheduleModalHelper,
  closeDialog: handleCloseModal,
};

describe('<ScheduleModal Component/>', () => {
  it('will be mounted correctly', () => {
    render(<ScheduleModal {...initialProps} />);
  });

  it('click to button close', async () => {
    render(<ScheduleModal {...initialProps} />);
    await user.click(screen.getByTestId('close-btn'));
    expect(handleCloseModal).toHaveBeenCalled();
  });

  afterEach(() => {
    handleCloseModal.mockClear();
  });
});
