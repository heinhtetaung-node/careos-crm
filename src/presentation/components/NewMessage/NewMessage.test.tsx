import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';

import { render, fireEvent, screen, waitFor } from '__tests__/rtl-test-utils';
import { store } from 'presentation/redux/store';

import NewMessage from './index';

const TIMER = 5000;

const props = {
  handleCancelMessage: jest.fn(),
};

jest.mock('uuid', () => ({ v4: () => '00000000-0000-0000-0000-000000000000' }));

describe('<New Message Component/>', () => {
  beforeEach(() => {
    render(
      <Provider store={store as any}>
        <NewMessage {...props} />
      </Provider>
    );
  });

  it('initial state', async () => {
    await waitFor(
      () => {
        screen.getByText('text.cancelButton');
        screen.getByText('text.send');
        const button = screen.getByTestId('send-message');

        fireEvent.click(button);
      },
      { interval: TIMER }
    );
  });

  it('Fire Cancel Button', async () => {
    const elem = screen.getByText('text.cancelButton');
    fireEvent.click(elem);
    expect(props.handleCancelMessage).toHaveBeenCalled();
  });

  it('change template and select other', async () => {
    const inputElm = screen.getByTestId('select-emailTemplate');
    fireEvent.change(inputElm, {
      target: {
        value: 'other',
      },
    });

    const toElm = screen.getByTestId('input-to');
    await userEvent.type(toElm, 'xyz@gmail.com');

    const subject = screen.getByTestId('input-subject');

    await userEvent.type(subject, 'test subject changed');

    const button = screen.getByTestId('send-message');

    fireEvent.click(button);
  });

  it('To email validation', async () => {
    const inputElm = screen.getByTestId('select-emailTemplate');
    fireEvent.change(inputElm, {
      target: {
        value: 'other',
      },
    });

    const toElm = screen.getByTestId('input-to');
    await userEvent.type(toElm, 'xyz');

    const subject = screen.getByTestId('input-subject');

    await userEvent.type(subject, 'test subject changed');
  });
});
