import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import HistoryLog from './HistoryLog';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/orders/uuid/policies/L9854860-1/submission',
  }),
}));

const initialState = {
  authReducer: {
    data: {
      user: {
        role: 'roles/admin',
      },
    },
  },
};

describe('Test <HistoryLog />', () => {
  beforeEach(() => {
    server.use(
      http.get(
        getApiEndpoint(
          `api/insurer-integrations/v1alpha1/orders/:orderId/items/:itemId/submissions`
        ),
        () =>
          HttpResponse.json({
            submissions: [
              {
                name: 'submissions/d9cc2920-6e42-41f0-801e-ca795097a83b',
                createTime: '2023-03-30T04:42:28.134033Z',
                updateTime: '2023-03-30T04:42:28.134033Z',
                deleteTime: null,
                createBy: '',
                result: 'message',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        getApiEndpoint(`v1alpha1/orders/undefined/resourceHistory`),
        () => HttpResponse.json({})
      )
    );
  });

  test('should <HistoryLog/> component button correctly render submission and communication button click on each button render respective component', async () => {
    render(<HistoryLog />, { initialState });
    const submissionButton = screen.getByText('menu.order.submission');
    const communicationButton = screen.getByText('lead.communication');
    const activityButton = screen.getByText('lead.activity');

    expect(submissionButton).toBeInTheDocument();
    expect(communicationButton).toBeInTheDocument();
    expect(activityButton).toBeInTheDocument();

    await userEvent.click(communicationButton);

    expect(screen.getByTestId('communication-table')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('close-dialog-button'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('communication-table')
      ).not.toBeInTheDocument();
    });
    await userEvent.click(submissionButton);

    expect(screen.getByTestId('submission-table')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('close-dialog-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('submission-table')).not.toBeInTheDocument();
    });
    await userEvent.click(activityButton);

    expect(screen.getByTestId('test-history-table')).toBeInTheDocument();
  });

  test('should <HistoryLog/> show <SubmissionTable/> when submission button was clicked', async () => {
    render(<HistoryLog />, { initialState });
    const submissionButton = screen.getByText('menu.order.submission');

    await userEvent.click(submissionButton);

    const message = await screen.findByText('message');
    expect(message).toBeInTheDocument();

    const [_, responseDate] = await screen.findAllByText('30/03/2023');
    const [__, responseTime] = await screen.findAllByText('(11:42:28 AM)');

    expect(responseDate).toBeInTheDocument();
    expect(responseTime).toBeInTheDocument();
  });

  test('Test by clicking all tabs`', async () => {
    render(<HistoryLog />, { initialState });
    const submissionButton = screen.getByText('menu.order.submission');
    await userEvent.click(submissionButton);
    await userEvent.click(screen.getAllByRole('button')[1]);
    await userEvent.click(screen.getAllByRole('button')[2]);
    await userEvent.click(screen.getAllByRole('button')[3]);
  });
});

test('should <SubmissionTable/> render error message when upstream API broke', async () => {
  server.use(
    http.get(
      getApiEndpoint(
        `api/insurer-integrations/v1alpha1/orders/:orderId/items/:itemId/submissions`
      ),
      () => HttpResponse.json({ error: 'error' }, { status: 503 })
    )
  );

  render(<HistoryLog />, { initialState });
  const submissionButton = screen.getByText('menu.order.submission');

  await userEvent.click(submissionButton);

  const errorMsg = await screen.findByText('order.historyLog.errorMessage');
  expect(errorMsg).toBeInTheDocument();
});

test('should <SubmissionTable/> show no data message when there is no submissions', async () => {
  server.use(
    http.get(
      getApiEndpoint(
        `api/insurer-integrations/v1alpha1/orders/:orderId/items/:itemId/submissions`
      ),
      () => HttpResponse.json({ submissions: [] })
    )
  );

  render(<HistoryLog />, { initialState });
  const submissionButton = screen.getByText('menu.order.submission');

  await userEvent.click(submissionButton);

  const noDataMsg = await screen.findByText('text.noData');
  expect(noDataMsg).toBeInTheDocument();
});
