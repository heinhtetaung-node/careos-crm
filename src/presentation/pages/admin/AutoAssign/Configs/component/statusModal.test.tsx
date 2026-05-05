// eslint-disable @typescript-eslint/no-non-null-assertion
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import AutoAssignStatusModal from './autoAssignStatusModal';

const mockDispatch = jest.fn();
const close = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('data/slices/autoAssignLeadSlice', () => ({
  useUpdateAgentStatusMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      data: {},
      isLoading: false,
    },
  ]),
}));
jest.useFakeTimers();
describe.skip('Testing Agent Status Modal With ID', () => {
  it('should show success alert if "id" is not empty ', async () => {
    render(
      <AutoAssignStatusModal
        id="d75da877-07b6-4f61-981c-6118772c1027"
        onClose={close}
      />
    );

    await userEvent.click(
      document.getElementById('mui-component-select-autoassign-status')!
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
    expect(close).toHaveBeenCalledWith(true);
  });
});

describe('Testing Auto Assign StatusModal without ID', () => {
  it('should render autoAssignStatusModal component', () => {
    render(<AutoAssignStatusModal id="" onClose={close} />);
    expect(screen.getByTestId('autoassign-status-modal')).toBeInTheDocument();
  });

  it.skip('should disable the button on select of option', async () => {
    render(<AutoAssignStatusModal id="" onClose={close} />);

    await userEvent.click(
      document.getElementById('mui-component-select-autoassign-status')!
    );
    await userEvent.click(screen.getByRole('listbox').lastElementChild!);
    expect(
      screen.getByRole('button', { name: 'text.confirmChange' })
    ).toBeEnabled();
  });

  it.skip('should close the model on click of cancel button', async () => {
    render(<AutoAssignStatusModal id="" onClose={close} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
    expect(close).toHaveBeenCalled();
  });

  it.skip('should show error alert if "id" is empty ', async () => {
    render(<AutoAssignStatusModal id="" onClose={close} />);

    await userEvent.click(
      document.getElementById('mui-component-select-autoassign-status')!
    );
    await userEvent.click(screen.getByRole('listbox').lastElementChild!);
    await userEvent.click(
      screen.getByRole('button', { name: 'text.confirmChange' })
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        isOpen: true,
        message: 'errors.selectAgent',
        status: 'error',
      },
      type: '[UI] SHOW_SNACKBAR',
    });
  });
});
