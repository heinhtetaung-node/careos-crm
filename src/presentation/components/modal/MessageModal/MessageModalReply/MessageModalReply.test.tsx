import React from 'react';
import { Provider } from 'react-redux';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';
import { store } from 'presentation/redux/store';

import MessageModalReply from './index';

const props = {
  handleCancelMessage: jest.fn(),
  replyType: '',
};

jest.mock('uuid', () => ({ v4: () => '00000000-0000-0000-0000-000000000000' }));

describe('<Email Form Component/>', () => {
  beforeEach(() => {
    render(
      <Provider store={store as any}>
        <MessageModalReply {...props} />
      </Provider>
    );
  });

  it('initial state', async () => {
    screen.getByText('text.replyMessage');
    screen.getByText('text.cancelButton');
    screen.getByText('text.send');

    const button = screen.getByText('text.send');

    fireEvent.click(button);
  });
  it('cancel Message', async () => {
    const button = screen.getByText('text.cancelButton');

    fireEvent.click(button);
    expect(props.handleCancelMessage).toHaveBeenCalled();
  });
});
