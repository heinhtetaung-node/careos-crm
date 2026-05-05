import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { ItemSubmissionStatus } from 'shared/constants/orderType';

import SubmissionStatusForm from './SubmissionStatusForm';

const handleSubmit = jest.fn();
const setDialogProps = jest.fn();

describe('<SubmissionStatusForm> shows comment and status options', () => {
  it('Should render submit button with enabled state', () => {
    render(
      <SubmissionStatusForm
        onSubmit={handleSubmit}
        setDialogProps={setDialogProps}
        submissionStatus={ItemSubmissionStatus.PENDING}
        isQcApproved={false}
      />
    );
    expect(screen.getByTestId('submission-status-form')).toBeInTheDocument();
  });

  it('Should status options for Ready to Submit status', async () => {
    render(
      <SubmissionStatusForm
        onSubmit={handleSubmit}
        setDialogProps={setDialogProps}
        submissionStatus={ItemSubmissionStatus.READY_TO_SUBMIT}
        isQcApproved
      />
    );
    expect(screen.getByTestId('custom-autocomplete')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      screen.getByRole('option', {
        name: 'submissionStatus.submit',
      })
    );
    expect(screen.getAllByRole('textbox')[0]).toHaveValue(
      'submissionStatus.submit'
    );
  });

  it('Should status options for Pending status', async () => {
    render(
      <SubmissionStatusForm
        onSubmit={handleSubmit}
        setDialogProps={setDialogProps}
        submissionStatus={ItemSubmissionStatus.PENDING}
        isQcApproved
      />
    );
    expect(screen.getByTestId('custom-autocomplete')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});
