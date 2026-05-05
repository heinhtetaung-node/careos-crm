import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockOrderDocuments as MockOrders } from 'mock-data/OrderListingView.mock';
import { mockAdminWhoami, MockUsersData } from 'mock-data/UserData.mock';
import { store } from 'presentation/redux/store';

import MyOrder from '.';

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

const saleAgent = {
  name: 'users/b676526d-2ce3-465a-9854-62b2143ee806',
  createTime: '2022-05-05T07:41:52.962994Z',
  updateTime: '2022-05-05T07:42:02.691555Z',
  deleteTime: null,
  createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
  humanId: '18007639358195465@cypress.co.th',
  role: 'roles/sales',
  firstName: 'CypressUpd',
  lastName: 'TestUpd',
  annotations: {
    daily_limit: '400',
    score: '3',
    total_limit: '200',
  },
  loginTime: null,
};

// TODO: correct me, i'm wrong test
test.skip('<MyOrder/> render successfully', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
      () => HttpResponse.json(mockAdminWhoami)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:userId`,
      () => HttpResponse.json(saleAgent)
    ),
    http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
      HttpResponse.json(MockUsersData)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
      () => HttpResponse.json(MockOrders)
    )
  );

  render(
    <ComponentWithProvider>
      <MyOrder />
    </ComponentWithProvider>
  );

  const tableRow = await screen.findAllByTestId('order-listing-table-row');
  await waitFor(() => {
    expect(within(tableRow[0]).getByText('O57083')).toBeInTheDocument();
    expect(
      within(tableRow[0]).getByText('text.earliestOn')
    ).toBeInTheDocument();
    expect(within(tableRow[0]).getByText('01/05/2023')).toBeInTheDocument();
  });
});

// TODO: correct me, i'm wrong test
describe.skip('Test <MyOrder/> pagination', () => {
  beforeAll(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/dev/.ory/kratos/sessions/whoami`,
        () => HttpResponse.json(mockAdminWhoami)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:userId`,
        () => HttpResponse.json(saleAgent)
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
        () =>
          HttpResponse.json({
            orders: [
              ...MockOrders.orders,
              {
                ...MockOrders.orders[0],
                order: {
                  ...MockOrders.orders[0].order,
                  name: 'orders/dee8b8b6-9bd7-452a-a230-ec6ca265d799',
                  humanId: 'O57099',
                },
              },
            ],
            total: 4,
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:userId`,
        () => HttpResponse.json(saleAgent)
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      )
    );
  });

  it('Should pagination works', async () => {
    render(
      <ComponentWithProvider>
        <MyOrder />
      </ComponentWithProvider>
    );

    const tableRows = await screen.findAllByTestId('order-listing-table-row');
    expect(tableRows).toHaveLength(4);

    const pageButton = await screen.findByLabelText('page 1');
    expect(pageButton).toBeInTheDocument();

    await userEvent.click(pageButton);
    expect(await screen.findByText('O57099')).toBeInTheDocument();
  });
});
