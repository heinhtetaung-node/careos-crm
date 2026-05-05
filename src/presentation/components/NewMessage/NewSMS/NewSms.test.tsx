import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, fireEvent, screen, waitFor } from '__tests__/rtl-test-utils';

import NewSMS from './index';

const TIMER = 5000;

const props = {
  sendSms: jest.fn(),
  handleCancelMessage: jest.fn(),
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue([
    {
      phone: '+92310231332',
    },
  ]),
}));

jest.mock('uuid', () => ({ v4: () => '00000000-0000-0000-0000-000000000000' }));

describe('<NewSms Component/>', () => {
  it('initial state', async () => {
    render(<NewSMS {...props} />);
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
    render(<NewSMS {...props} />);
    const elem = screen.getByText('text.cancelButton');
    await userEvent.click(elem);
    expect(props.handleCancelMessage).toHaveBeenCalled();
  });

  it('handle Change sms form', async () => {
    render(<NewSMS {...props} />);
    const message = screen.getByTestId('input-smsMessage');
    await userEvent.type(message, 'message');
    const elem = screen.getByText('text.send');
    await userEvent.click(elem);
  });
});
