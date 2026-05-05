import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import AutoAssignSettingModal from './autoAssignSettingModal';

const mockDispatch = jest.fn();
const close = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('data/slices/autoAssignLeadSlice', () => {
  return {
    useUpdateAutoAssignSettingsMutation: jest.fn().mockReturnValue([
      jest.fn(),
      {
        isSuccess: true,
        data: {},
        isLoading: false,
      },
    ]),
  };
});

describe('Testing AutoAssignSettingModal component', () => {
  it('should render autoAssignStatusModal component', () => {
    render(<AutoAssignSettingModal values={undefined} onClose={close} />);
    expect(screen.getByTestId('autoassign-setting-modal')).toBeInTheDocument();
  });
  it('should close the model on click of cancel button', () => {
    render(<AutoAssignSettingModal values={undefined} onClose={close} />);

    userEvent.click(screen.getByRole('button', { name: 'text.cancelButton' }));
    expect(close).toHaveBeenCalled();
  });
  it('should render the value if passed as props', () => {
    render(
      <AutoAssignSettingModal
        values={{
          autoAssignmentEnabled: false,
          premiumLeadThreshold: 0,
          numTopTier: 2,
        }}
        onClose={close}
      />
    );
    const inputs = screen.getAllByRole('textbox');

    expect(inputs[0].getAttribute('value')).toBe('0');
    expect(inputs[1].getAttribute('value')).toBe('2');
  });

  it('should respond with success if API responds with success', () => {
    render(
      <AutoAssignSettingModal
        values={{
          autoAssignmentEnabled: false,
          premiumLeadThreshold: 0,
          numTopTier: 2,
        }}
        onClose={close}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'text.update' }));
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        isOpen: true,
        message: 'text.updatedInformation',
        status: 'success',
      },
      type: '[UI] SHOW_SNACKBAR',
    });
    expect(close).toHaveBeenCalledWith(true);
  });
});
