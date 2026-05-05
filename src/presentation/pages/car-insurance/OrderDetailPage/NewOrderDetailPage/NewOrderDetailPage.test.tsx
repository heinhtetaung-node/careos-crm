import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen } from '__tests__/rtl-test-utils';

import NewOrderDetailPage from '.';

var mockedUseParams: jest.Mock;

// Mock routes to avoid circular dependency issues
jest.mock('presentation/routes', () => ({
  sidebar: [],
  healthSidebar: [],
  travelSidebar: [],
}));

jest.mock('shared/constants/headerRoutes', () => ({
  __esModule: true,
  default: [
    {
      id: 1,
      icon: '',
      path: '/leads/my-leads',
      text: 'text.myLead',
    },
    {
      id: 3,
      icon: '',
      path: '#',
      type: 'appointment',
      text: 'text.myAppointment',
    },
  ],
  myOrderRoute: {
    id: 2,
    icon: '',
    path: '/orders/my-orders',
    text: 'text.myOrder',
  },
  comissionReportRoute: {
    id: 4,
    icon: '',
    path: '/commission-report',
    text: 'text.commissionReport',
  },
  emptyHeaderRoutes: [],
  healthHeaderRoutes: () => [],
}));

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockedUseParams,
  };
});

test('NewOrderDetailPage Component has error', async () => {
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
      () => HttpResponse.json({ error: 'not found' }, { status: 500 })
    )
  );
  mockedUseParams.mockReturnValue({
    orderId: '643ff7dc-e33f-4bd0-a046-7a81cda1e232',
  });
  // Resolve promise for mock fetch
  await Promise.resolve();
  render(<NewOrderDetailPage />);
  await waitFor(() => {
    expect(screen.queryByText('errorPage.notFoundText')).toBeInTheDocument();
  });
});

test('NewOrderDetailPage Component successfully gets orderPolicy data', async () => {
  server.use(
    http.get(
      `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
      () =>
        HttpResponse.json({
          items: [
            {
              item: {
                motorItemType: 'MOTOR_TYPE_2',
                policyStartDate: '2022-01-01T00:00:00Z',
                grossPremium: '400000',
              },
              package: {
                carInsuranceType: 'TYPE_2',
              },
            },
            {
              item: {
                motorItemType: 'MOTOR_TYPE_COMPULSORY',
                policyStartDate: '2022-01-01T00:00:00Z',
                grossPremium: '400000',
              },
              package: {
                carInsuranceType: 'MANDATORY',
              },
            },
          ],
          customer: {
            customer: {
              name: 'customers/40c4687d-93cb-48ce-ac5c-b49c941643f2',
              createTime: '2022-01-18T07:01:26.471574Z',
              updateTime: '2022-01-18T07:01:26.471574Z',
              deleteTime: null,
              createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
              humanId: 'C55557',
              firstName: 'Sunee',
              lastName: 'Pui',
              gender: 'female',
              language: 'thai',
              title: 'mrs',
            },
            phones: [],
            emails: [],
          },
        })
    )
  );
  mockedUseParams.mockReturnValue({
    orderId: '643ff7dc-e33f-4bd0-a046-7a81cda1eexx',
  });
  // Resolve promise for mock fetch
  await Promise.resolve(true);
  render(<NewOrderDetailPage />);
  await waitFor(() => {
    expect(screen.getByTestId('new-order-detail-page')).toBeTruthy();
  });
});
