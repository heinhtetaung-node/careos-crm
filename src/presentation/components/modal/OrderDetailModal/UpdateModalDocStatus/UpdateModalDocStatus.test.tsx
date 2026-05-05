import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { render, screen } from '__tests__/rtl-test-utils';
import { initialState } from 'mock-data/ReduxStore.mock';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import OrderUpdateModalDocStatus from './index';

const Warning = (
  <ul>
    <li>Policyholder Info: Title</li>
    <li>Policyholder Info: DOB</li>
    <li>Vehicle: 2nd driver DOB</li>
    <li>Documents: 1st Named Driver License</li>
  </ul>
);
const mockStore = configureMockStore();
const testStore = mockStore({
  ...initialState,
  order: {
    ...initialState.order,
    payload: {
      ...initialState.order.payload,
      documentStatus: OrderDocumentStatus.COMPLETE,
    },
  },
});
test('render OrderUpdateModalDocStatus view successfully', () => {
  const { getByTestId } = render(
    <OrderUpdateModalDocStatus close={() => null} />
  );
  expect(getByTestId('order-update-modal-demo')).toBeTruthy();

  const updateButton = screen.getByTestId('document-status-update-button');
  expect(updateButton).toBeDisabled();
});

test('render OrderUpdateModalDocStatus with update button enable', async () => {
  render(
    <Provider store={testStore as any}>
      <OrderUpdateModalDocStatus close={() => null} />
    </Provider>
  );
  const commentField = screen.getByRole('textbox') as HTMLInputElement;
  userEvent.type(commentField, 'Update document comment');
  userEvent.tab();
  const updateButton = screen.getByTestId('document-status-update-button');
  await waitFor(() => {
    expect(updateButton).not.toBeDisabled();
  });
});

test('render OrderUpdateModalDocStatus if there is a warning view successfully', () => {
  render(<OrderUpdateModalDocStatus close={() => null} warning={Warning} />);
  expect(screen.getByTestId('order-update-modal-demo__warning')).toBeTruthy();
});

test('render OrderUpdateModalDocStatus if there is no warning view successfully', () => {
  const { queryByTestId } = render(
    <OrderUpdateModalDocStatus close={() => null} />
  );
  expect(queryByTestId('order-update-modal-demo__warning')).toBeFalsy();
});
