import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  ComponentWithProvider,
  render,
  screen,
  waitFor,
  within,
} from '__tests__/rtl-test-utils';
import { MockOrderDocuments } from 'mock-data/OrderListingView.mock';
import { MockUsersData } from 'mock-data/UserData.mock';
import getApiEndpoint from 'utils/endpointHelper';

import CancellationAllPage from './index';

jest.mock('data/slices/orderSlice', () => ({
  useLazySearchOrdersQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isFetching: false,
      isSuccess: true,
      data: MockOrderDocuments,
    },
  ]),
}));

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

test.skip('renders Cancellation all page successfully', async () => {
  server.use(
    http.get(getApiEndpoint(`/api/user/v1alpha1/users`), () =>
      HttpResponse.json(MockUsersData)
    )
  );

  render(
    <ComponentWithProvider>
      <CancellationAllPage />
    </ComponentWithProvider>,
    { initialState }
  );

  expect(screen.getByTestId('cancellation-page')).toBeInTheDocument();
  expect(screen.getByTestId('filter-panel')).toBeInTheDocument();

  const pagination = screen.getAllByTestId('pagination-mui')[0];
  const paginationBtns = await within(pagination).findAllByRole('button');
  userEvent.click(paginationBtns[2]);

  const paginationAfterPageChanged = await within(
    screen.getAllByTestId('pagination-mui')[0]
  ).findAllByRole('button');

  await waitFor(() =>
    expect(paginationAfterPageChanged[1]).toHaveClass('Mui-selected')
  );
});
