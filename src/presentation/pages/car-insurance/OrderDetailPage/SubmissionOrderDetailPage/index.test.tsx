import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';

import orderHandler from '__mocks__/handlers/order';
import { server } from '__mocks__/server';
import { render, screen } from '__tests__/rtl-test-utils';
import { mockIntergrationResponse } from 'mock-data/IntergrationResponse.mock';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { store } from 'presentation/redux/store';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import SubmissionOrderDetailPage from '.';

var mockHistoryPush: jest.Mock;
var mockParams: jest.Mock;
jest.mock('react-router-dom', () => {
  mockHistoryPush = jest.fn();
  mockParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockParams,
    useNavigate: jest.fn().mockReturnValue(mockHistoryPush),
  };
});

jest.mock('data/slices/insurerIntegrationSlice', () => ({
  useGetIntegrationResultQuery: jest.fn().mockReturnValue({
    isUninitialized: false,
    isSuccess: true,
    data: mockIntergrationResponse,
  }),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest
    .fn()
    .mockReturnValue({ data: { role: 'roles/admin', name: 'user-1213' } }),
}));

test('SubmissionOrderDetailPage Component has error', async () => {
  server.use(
    http.get(getApiEndpoint(`/v1alpha1/orders/:orderId`), () =>
      HttpResponse.json({ error: 'not found' }, { status: 500 })
    )
  );
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <SubmissionOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test('SubmissionOrderDetailPage Component fail by wrong data', async () => {
  const wrongData = {
    ...OrderDetail,
    car: {},
  };
  server.use(
    http.get(getApiEndpoint(`/v1alpha1/orders/:orderId`), () =>
      HttpResponse.json(wrongData)
    )
  );
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <SubmissionOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test.skip('SubmissionOrderDetailPage Component loads', async () => {
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(6000);
  render(
    <Provider store={store as any}>
      <SubmissionOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});

test('SubmissionOrderDetailPage Component successfully gets orderPolicy data', async () => {
  server.use(
    http.get(getApiEndpoint(`/v1alpha1/orders/:orderId`), () =>
      HttpResponse.json(OrderDetail)
    )
  );
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });

  let submissionOrderEl: HTMLElement | undefined;
  let orderIdEl: HTMLElement | undefined;
  render(<SubmissionOrderDetailPage />);
  await waitFor(() => {
    submissionOrderEl = screen.getByTestId<HTMLElement>('submission-order');
    orderIdEl = screen.getByTestId<HTMLElement>('order-id');
  });

  expect(submissionOrderEl).toBeTruthy();
  expect(orderIdEl).toBeInTheDocument();
});

test('SubmissionOrderDetailPage Component no orderId or policy Id', async () => {
  mockParams.mockReturnValue({
    orderId: '',
    policyId: '',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(
    <Provider store={store as any}>
      <SubmissionOrderDetailPage />
    </Provider>
  );
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test.skip('SubmissionOrderDetailPage should last API status visible', async () => {
  server.use(orderHandler[0]);
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });

  render(<SubmissionOrderDetailPage />);
  expect(await screen.findByText('text.apiFailed')).toBeInTheDocument();
});

test('SubmissionOrderDetailPage should have approval button', async () => {
  const mockOrderSubmitted = {
    ...OrderDetail,
    items: [
      {
        ...OrderDetail.items[1],
        item: {
          ...OrderDetail.items[1].item,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        },
      },
    ],
  };
  server.use(
    http.get(
      getApiEndpoint('/v1alpha1/orders/:orderId', ServicesName.GFF),
      (_) => HttpResponse.json(mockOrderSubmitted)
    )
  );
  mockParams.mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    policyId: 'L9854860-1',
  });

  render(<SubmissionOrderDetailPage />);
  const approvalBtn = await screen.findByTestId('btn-approval');
  expect(approvalBtn).toBeInTheDocument();
  expect(approvalBtn).not.toBeDisabled();

  await userEvent.click(approvalBtn);
  expect(mockHistoryPush).toHaveBeenCalledWith('../approval', {
    relative: 'path',
  });
});
