import { render, screen, fireEvent, queryByText } from '@testing-library/react';
import { initialState } from 'mock-data/ReduxStore.mock';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import SMSForm from './index';

jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn().mockReturnValue({
    data: {
      firstName: 'test',
      lastName: 'name',
    },
  }),
}));

const props = {
  changeForm: jest.fn(),
  sms: {
    smsMessage: 'test',
    smsTemplate: '',
    phone: '+923104505243',
  },
};
const mockStore = configureMockStore();

const store = mockStore(initialState);

describe('<Sms Form Component/>', () => {
  beforeEach(() => {
    render(
      <Provider store={store as any}>
        <SMSForm {...props} />
      </Provider>
    );
  });

  it('initial state', async () => {
    screen.getByText('text.smsTemplate');
    screen.getByText('text.phoneNumber');
    screen.getByText('text.message');
    screen.getByText('text.select');

    expect(
      queryByText(screen.getByText('text.smsTemplate'), 'text.smsTemplate')
    ).toBeTruthy();
  });

  it('select lineAccount template', () => {
    const select = screen.getByTestId('select-smsTemplate');
    fireEvent.change(select, {
      target: {
        value: 'lineAccount',
      },
    });
    expect(props.changeForm).toHaveBeenCalled();
  });
  it('select requestDocuments template', () => {
    const select = screen.getByTestId('select-smsTemplate');
    fireEvent.change(select, {
      target: {
        value: 'requestDocuments',
      },
    });
    expect(props.changeForm).toHaveBeenCalled();
  });
  it('select notReachable template', () => {
    const select = screen.getByTestId('select-smsTemplate');
    fireEvent.change(select, {
      target: {
        value: 'notReachable',
      },
    });
    expect(props.changeForm).toHaveBeenCalled();
  });
  it('select phone', () => {
    const select: HTMLInputElement = screen.getByTestId('select-phone');
    fireEvent.change(select, {
      target: {
        value: '0',
      },
    });
    expect(select.value).toBe('0');
  });
});
