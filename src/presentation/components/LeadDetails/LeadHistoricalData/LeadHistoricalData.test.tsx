import HistoryResponse from '@alphafounders/mock-data/json/leadHistory.json';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import LeadHistoricalData from '.';

describe('Testing LeadHistoricalData component', () => {
  it.skip('should render the component and calls api', async () => {
    const mockedApiHandler = jest.fn();
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha1/leads/00000000-0000-0000-0000-000000000000:history',
          ServicesName.GFF
        ),
        async ({ request }) =>
          HttpResponse.json(mockedApiHandler(await request.json()))
      )
    );

    render(
      <LeadHistoricalData
        leadId="leads/00000000-0000-0000-0000-000000000000"
        sourceId="sources/fakeSourceId"
      />
    );

    expect(screen.getByTestId('lead-extra-json-details')).toBeInTheDocument();
    await waitFor(() => expect(mockedApiHandler).toHaveBeenCalledTimes(1));
  });

  it('renders the api data correctly and renders the preset buttons', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha1/leads/00000000-0000-0000-0000-000000000000:history',
          ServicesName.GFF
        ),
        () => HttpResponse.json(HistoryResponse)
      )
    );

    render(
      <LeadHistoricalData
        leadId="leads/00000000-0000-0000-0000-000000000000"
        sourceId="sources/ac666bff-ec89-423e-a55d-9d0534f33b63"
      />
    );
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    expect(screen.getByTestId('lead-extra-json-details')).toBeInTheDocument();
    expect(screen.getByTestId('json-response')).toBeInTheDocument();
    expect(screen.getByTestId('preset-button-car')).toBeInTheDocument();
    expect(screen.getByTestId('preset-button-reset')).toBeInTheDocument();
    expect(screen.getByTestId('preset-button-reset')).toBeDisabled();

    await userEvent.type(screen.getByTestId('search-input'), 'car');
    expect(screen.getByTestId('preset-button-reset')).toBeEnabled();

    waitFor(() => {
      expect(screen.getByTestId('preset-button-reset')).toBeEnabled();
      expect(screen.getByTestId('search-input')).toHaveValue('car');
    });

    await userEvent.click(screen.getByTestId('preset-button-car'));

    waitFor(() => {
      expect(screen.getByTestId('preset-button-car')).toBeDisabled();
      expect(screen.getByTestId('preset-button-reset')).toBeEnabled();
    });

    await userEvent.click(screen.getByTestId('preset-button-reset'));
    screen.getByTestId('search-input').focus();
    await userEvent.paste('address');
    expect(screen.getByTestId('preset-button-reset')).toBeEnabled();
  });
});
