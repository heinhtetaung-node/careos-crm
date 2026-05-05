/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import StatusModal from './statusModal';

const mockDispatch = jest.fn();
const close = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.useFakeTimers();
jest.mock('data/slices/orderSlice', () => ({
  useUpdateOrderConfigStatusMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      data: {},
      isLoading: false,
    },
  ]),
}));

// FIXME: takes too long to run
describe.skip('<StatusModal />', () => {
  it('should show success alert', async () => {
    render(<StatusModal id="orders/test-123" onClose={close} />);

    await userEvent.click(
      document.getElementById('mui-component-select-config-status')!
    );
    await userEvent.click(screen.getByRole('listbox').lastElementChild!);
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmChange',
    });
    expect(confirmBtn).toBeEnabled();
    await userEvent.click(confirmBtn);
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
    render(<StatusModal id="orders/test-123" onClose={close} />);
    const closeBtn = screen.getByRole('button', {
      name: 'text.cancelButton',
    });

    userEvent.click(closeBtn);
    expect(close).toHaveBeenCalled();
  });
});
