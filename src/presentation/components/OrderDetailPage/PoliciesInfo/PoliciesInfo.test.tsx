import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PoliciesInfo from './PoliciesInfo';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

jest.mock('data/slices/orderSlice', () => ({
  useGetOrderPolicyItemsQuery: jest.fn().mockReturnValue({
    data: [
      {
        name: 'test-123',
        humanId: '123',
        insurer: 'insurers/42',
        motorItemType: 'MOTOR_TYPE_1',
        policyStartDate: '2025-01-22T04:30:00.000Z',
        approvalStatus: 'ITEM_APPROVAL_STATUS_APPROVED',
        submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        package: 1,
      },
      {
        name: 'test-5405',
        humanId: '545',
        insurer: 'insurers/7',
        motorItemType: 'MOTOR_TYPE_2',
        policyStartDate: '2025-11-30T11:30:00.000Z',
        approvalStatus: 'ITEM_APPROVAL_STATUS_PENDING',
        submissionStatus: 'ITEM_SUBMISSION_STATUS_PENDING',
        package: 2,
      },
    ],
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useGetOrderItemsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useUpdateOrderByIdMutation: jest.fn().mockReturnValue([jest.fn()]),
}));

jest.mock('data/slices/packageSlice', () => ({
  useLazyGetRenewalPackageDetailsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

describe('Test <PoliciesInfo/>', () => {
  it('Should render policy info', () => {
    const { rerender } = render(<PoliciesInfo />);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.queryAllByTestId('expand-package-details')).toHaveLength(2);
    rerender(<PoliciesInfo isReadOnly />);
    expect(screen.getByText('22/01/2025')).toBeInTheDocument();
  });

  it('Should render covernote download buttons', () => {
    render(<PoliciesInfo isReadOnly covernoteDownload />);
    const downloadBtns = screen.getAllByRole('button', {
      name: 'text.download',
    });
    expect(downloadBtns).toHaveLength(1);
  });

  it('Should open policy details dialog', async () => {
    render(<PoliciesInfo />);
    const button = screen.queryAllByTestId('expand-package-details')[0];
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('package-details-dialog')).toBeInTheDocument();
    });
    const datePicker = screen.getByTestId('545-policy-start-date-datefield');
    const input = datePicker.getElementsByTagName('input')[0];

    expect(datePicker).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    await userEvent.type(input, '30/11/2025');
    await userEvent.tab();
    await waitFor(() => {
      expect(input).toHaveValue('30/11/2025');
    });
  });
});
