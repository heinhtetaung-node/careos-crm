import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import CopyButton from '.';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

jest.spyOn(navigator.clipboard, 'writeText');
const mockStore = configureMockStore();
const initialState = {};

test('renders CopyButton successfully', async () => {
  render(
    <Provider store={mockStore(initialState) as any}>
      <CopyButton copyText="https://www.google.com" messageText="Success" />
    </Provider>
  );
  expect(screen.getByTestId('copy-button')).toBeTruthy();

  const button = screen.getByTestId('copy-button');
  await userEvent.click(button);
});
