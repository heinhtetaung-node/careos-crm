import userEvent from '@testing-library/user-event';
import { render, screen } from '__tests__/rtl-test-utils';
import React from 'react';

import DeleteConfigModal from './deleteConfigModal';

const mockDispatch = jest.fn();
const close = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.useFakeTimers();

jest.mock('data/slices/orderSlice', () => ({
  useDeleteOrderConfigMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      data: {},
      isLoading: false,
    },
  ]),
}));

describe('<DeleteConfigModal />', () => {
  it('should show success alert', async () => {
    render(
      <DeleteConfigModal
        id="orders/test-123"
        orderConfigData={{
          configId: 'orders/test-123',
          status: 'Present',
          group: 'Submission: Email',
          name: 'Test',
          effectiveDate: '05/06/2023',
          assignedOrder: 0,
        }}
        onClose={close}
      />
    );

    const confirmBtn = screen.getByRole('button', {
      name: 'menu.orderAutoAssignmentConfigDelete',
    });

    expect(confirmBtn).toBeEnabled();
    userEvent.click(confirmBtn);
    jest.advanceTimersByTime(3000);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        isOpen: true,
        message: 'menu.autoAssignment.agentStatusUpdated',
        status: 'success',
      },
      type: '[UI] SHOW_SNACKBAR',
    });
    expect(close).toHaveBeenCalled();
  });

  it('should close modal on click close', () => {
    render(
      <DeleteConfigModal
        id="orders/test-123"
        orderConfigData={{
          configId: 'orders/test-123',
          status: 'Present',
          group: 'Submission: Email',
          name: 'Test',
          effectiveDate: '05/06/2023',
          assignedOrder: 0,
        }}
        onClose={close}
      />
    );

    const closeBtn = screen.getByRole('button', {
      name: 'text.close',
    });

    userEvent.click(closeBtn);
    expect(close).toHaveBeenCalled();
  });
});
