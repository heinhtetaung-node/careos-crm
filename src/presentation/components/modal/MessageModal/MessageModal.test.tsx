import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { initialState } from 'mock-data/ReduxStore.mock';

import MessageModal from './index';

const mockAppState = {
  data: {
    smses: [
      {
        message: 'dummy sms message 1',
        phone: '+66942184515',
        createTime: Date.now(),
      },
      {
        message: 'dummy sms message 2',
        phone: '+66935284515',
        createTime: Date.now(),
      },
    ],
  },
  refetch: jest.fn(),
};
jest.mock('data/slices/leadDetails/smsSlice', () => ({
  ...jest.requireActual('data/slices/leadDetails/smsSlice'),
  useFetchSMSesQuery: jest.fn(() => mockAppState),
}));

const props = {
  openDialog: true,
  closeDialog: () => null,
  emailData: {
    data: {
      emails: [
        {
          bodyText: '',
        },
      ],
    },
  },
  smsData: {
    data: {
      smses: [
        {
          id: 2131,
          name: '',
          phone: '12312312312',
          status: 'completed',
          message: 'test',
        },
      ],
    },
  },
  attachment: {},
  currentCustomer: {
    data: {
      customerFirstName: 'test',
      customerLastName: 'test',
    },
    status: 'LEAD_STATUS_NEW',
    isRejected: false,
    name: 'test test',
    humanId: 'testId',
  },
};

// TODO: Fix tests to include expectation instead of blank test assertions
describe.skip('<MessageModal Component />', () => {
  beforeEach(() => {
    render(<MessageModal {...props} />, {
      initialState,
    });
  });

  it('initial State and close dialog', async () => {
    screen.getByText('text.mailboxCommunications');
    const button = screen.getByTestId('unittest__message__close-btn');
    fireEvent.click(button);
  });

  it('compose Message', async () => {
    const button = screen.getAllByText('text.compose');
    await userEvent.click(button[0]);
    await userEvent.click(button[1]);
  });

  it('List SMS item', async () => {
    const btn = screen.getByTestId('tab-btn-sms');
    await userEvent.click(btn);
  });

  it('List Email item', async () => {
    const btn = screen.getByTestId('tab-btn-email');
    await userEvent.click(btn);
  });

  it('List all items', async () => {
    const btn = screen.getByTestId('tab-btn-all');
    await userEvent.click(btn);
  });

  it('check text', async () => {
    screen.getAllByText('text.sms');
    screen.getAllByText('text.email');
    screen.getAllByText('text.noMessageSelected');
    screen.findByAltText('no Message');
  });

  it('item handleClick', async () => {
    const btn = screen.getAllByTestId('email-item');
    await userEvent.click(btn[0]);
  });

  it('item email click on email tab and reply btn', async () => {
    const tab = screen.getByTestId('tab-btn-email');
    await userEvent.click(tab);
    const btn = screen.getAllByTestId('email-item');
    await userEvent.click(btn[0]);
    const replyBtn = screen.getAllByTestId('reply-btn');
    await userEvent.click(replyBtn[0]);
  });

  it('item handleClick sms', async () => {
    const btn = screen.getAllByTestId('sms-item');
    await userEvent.click(btn[0]);
  });
});
