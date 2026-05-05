import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import AddQuoteURL from './AddQuoteURL';

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn(() => 'lead/leadId'),
}));

const pkgUrl =
  'https://staging-rc-website.rabbitinternet.com/product/motor-insurance/quotes?details=1346056&filter=insuranceCategory=both';

const mockSetMessage = jest.fn();

describe('<AddQuoteURL />', () => {
  beforeEach(() => mockSetMessage.mockClear());

  test('valid quote url', async () => {
    render(<AddQuoteURL message="" setEmailMessage={mockSetMessage} />);
    await user.type(screen.getByRole('textbox'), pkgUrl);
    expect(screen.getByRole('button', { name: 'text.add' })).not.toBeDisabled();
  });

  test('invalid quote url', async () => {
    render(<AddQuoteURL message="" setEmailMessage={mockSetMessage} />);
    await user.type(screen.getByRole('textbox'), 'invalid url');
    expect(screen.getByRole('button', { name: 'text.add' })).toBeDisabled();
  });

  test.skip('api call pending', async () => {
    server.use(
      http.post(
        getApiEndpoint('/api/leads/lead/leadId/transform-placeholders'),
        () => HttpResponse.json({ value: 'success' })
      )
    );
    render(<AddQuoteURL message="" setEmailMessage={mockSetMessage} />);
    await user.type(screen.getByRole('textbox'), pkgUrl);
    await user.click(screen.getByRole('button', { name: 'text.add' }));
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test.skip('api call success', async () => {
    server.use(
      http.post(
        getApiEndpoint('/api/leads/lead/leadId/transform-placeholders'),
        () => HttpResponse.json({ text: 'return message' })
      )
    );
    render(<AddQuoteURL message="" setEmailMessage={mockSetMessage} />);

    await user.type(screen.getByRole('textbox'), pkgUrl);
    await user.click(screen.getByRole('button', { name: 'text.add' }));

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(
      screen.queryByText('errorMessage.generalErrorMessage')
    ).not.toBeInTheDocument();
    expect(mockSetMessage).toHaveBeenCalledWith('return message');
  });

  test('api call error', async () => {
    server.use(
      http.post(
        getApiEndpoint('/api/leads/lead/leadId/transform-placeholders'),
        () =>
          new HttpResponse(
            {
              data: {
                message: 'Internal Server Error',
              },
            } as any,
            {
              status: 500,
            }
          )
      )
    );
    render(<AddQuoteURL message="" setEmailMessage={mockSetMessage} />);
    await user.type(screen.getByRole('textbox'), pkgUrl);
    await user.click(screen.getByRole('button', { name: 'text.add' }));
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(
        screen.getByText('errorMessage.generalErrorMessage')
      ).toBeInTheDocument();
      expect(mockSetMessage).not.toHaveBeenCalled();
    });
  });
});
