import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { ItemQcStatus, ItemSubmissionStatus } from 'shared/constants/orderType';

import SubmissionStatusButtons from '.';

const orderId = 'b5843e5c-8196-4d39-97c5-0700adc8a3f3';
jest.mock('data/slices/orderPolicySlice', () => ({
  useUpdatePolicyDataMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

describe('<SubmissionStatusButtons> Should prev-submit label works', () => {
  const policySubmit = {
    ...OrderDetail.items[1].item,
    qcStatus: ItemQcStatus.APPROVED,
    submissionStatus: ItemSubmissionStatus.PRESUBMITTED,
  };

  it('Should render Pre-submit button as disabled state', () => {
    render(<SubmissionStatusButtons policy={policySubmit} orderId={orderId} />);
    expect(
      screen.getByTestId('btn-presubmitted-submission')
    ).toBeInTheDocument();
  });
});

describe('<SubmissionStatusButtons> Should render dialog box and should submit changes', () => {
  test('Should submitted label display and it should be disabled', async () => {
    const policySubmit = {
      ...OrderDetail.items[1].item,
      submissionStatus: ItemSubmissionStatus.READY_TO_SUBMIT,
    };
    render(<SubmissionStatusButtons policy={policySubmit} orderId={orderId} />);
    expect(screen.getByTestId('btn-submitted-submission')).toBeInTheDocument();
    expect(screen.getByTestId('btn-submitted-submission')).toBeDisabled();
  });

  test('Should render dialog form', async () => {
    const policySubmit = {
      ...OrderDetail.items[1].item,
      qcStatus: ItemQcStatus.APPROVED,
      submissionStatus: ItemSubmissionStatus.PRESUBMITTED,
    };
    render(<SubmissionStatusButtons policy={policySubmit} orderId={orderId} />);
    expect(screen.getByTestId('btn-update-submission')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('btn-update-submission'));
    expect(screen.getByTestId('submission-status-form')).toBeInTheDocument();
  });
});
