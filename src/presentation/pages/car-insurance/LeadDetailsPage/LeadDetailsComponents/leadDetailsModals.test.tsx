import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import LeadDetailsModals from './leadDetailsModals';

const props = {
  classes: { grid: '' },
  openMessageModal: false,
  openScheduleModal: true,
  isPendingRejection: false,
  closeModalSchedule: jest.fn(),
  setOpenMessageModal: jest.fn(),
};

describe('Testing LeadDetailsModals ', () => {
  beforeEach(() => {
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <LeadDetailsModals {...props} />
      </MuiPickersUtilsProvider>
    );
  });

  it('should render LeadDetailsModals', () => {
    expect(screen.getByTestId('lead-detail-modal')).toBeInTheDocument();
  });

  it('should close schedule modal', () => {
    const closeBtn = screen.getByTestId('appointment-close-x');
    waitFor(() => {
      expect(closeBtn).toBeInTheDocument();
      closeBtn.click();
      expect(props.closeModalSchedule).toHaveBeenCalledWith(false);
    });
  });
});

describe('Testing MessageModal', () => {
  const newProps = { ...props, openMessageModal: true };
  beforeEach(() => {
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <LeadDetailsModals {...newProps} />
      </MuiPickersUtilsProvider>
    );
  });

  it('should render MessageModal and close when close button is clicked', () => {
    expect(screen.getByTestId('message-modal-component')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('unittest__message__close-btn');
    waitFor(() => {
      expect(closeBtn).toBeInTheDocument();
      closeBtn.click();
      expect(newProps.setOpenMessageModal).toHaveBeenCalledWith(false);
    });
  });
});
