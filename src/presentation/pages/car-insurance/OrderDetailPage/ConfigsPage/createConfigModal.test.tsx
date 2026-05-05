import userEvent from '@testing-library/user-event';
import { render, screen } from '__tests__/rtl-test-utils';
import React from 'react';

import CreateConfigModal from './createConfigModal';

const mockClose = jest.fn();
const mockConfigStatus = jest.fn();
const mockDispatch = jest.fn();

jest.mock('presentation/components/controls/Control', () => {
  function Autocomplete() {
    return (
      <div>
        <select id="autocomplete-options">
          <option value="test1">test1</option>
          <option value="test2">test2</option>
        </select>
      </div>
    );
  }

  function KeyBoardDatePicker({ onChange }: any) {
    return (
      <div>
        <input id="keyboard-date" type="text" onChange={onChange} />
      </div>
    );
  }

  function Button({ text, onClick }: any) {
    return (
      <button type="submit" id={text} onClick={() => onClick()}>
        {text}
      </button>
    );
  }

  return { Autocomplete, KeyBoardDatePicker, Button };
});
jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useGetUsersQuery: jest.fn().mockReturnValue({
    data: {
      users: [{ name: 'test', firstName: 'test', lastName: 'test' }],
    },
    isLoading: false,
  }),
}));
jest.mock('data/slices/orderSlice', () => ({
  ...jest.requireActual('data/slices/orderSlice'),
  useCreateOrderConfigMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      data: {
        success: true,
      },
      isLoading: false,
    },
  ]),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.useFakeTimers();

describe('<CreateConfigModal />', () => {
  it('should submit data and show alert', () => {
    render(
      <CreateConfigModal
        onClose={mockClose}
        setConfigStatus={mockConfigStatus}
      />
    );

    const agentOption = screen.getAllByRole('option')[0];
    userEvent.click(agentOption as HTMLElement);

    const groupOption = screen.getAllByRole('option')[2];
    userEvent.click(groupOption as HTMLElement);

    const submitBtn = document.getElementById('text.save');
    userEvent.click(submitBtn as HTMLElement);

    jest.advanceTimersByTime(3000);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        isOpen: true,
        message: 'menu.autoAssignment.agentStatusUpdated',
        status: 'success',
      },
      type: '[UI] SHOW_SNACKBAR',
    });
  });

  it('should close createConfig modal', () => {
    render(
      <CreateConfigModal
        onClose={mockClose}
        setConfigStatus={mockConfigStatus}
      />
    );

    const closeBtn = document.getElementById('text.close');
    userEvent.click(closeBtn as HTMLElement);
    expect(mockClose).toHaveBeenCalled();
  });
});
