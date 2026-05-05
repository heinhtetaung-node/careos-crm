import MatchingLeadResponse from '@alphafounders/mock-data/json/matchingLeadData.json';
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

import MatchingLeadData from '.';

describe('MatchingLeadData Component', () => {
  it('should render the component and calls api', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'leads/00000000-0000-0000-0000-000000000000:listMatchingLeads',
          ServicesName.GFF
        ),
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );

    render(
      <MatchingLeadData leadId="leads/00000000-0000-0000-0000-000000000000" />
    );
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    expect(screen.getByTestId('matching-leads-data')).toBeInTheDocument();
  });

  it('renders the api data correctly and renders the preset buttons', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'leads/00000000-0000-0000-0000-000000000000:listMatchingLeads',
          ServicesName.GFF
        ),
        () => HttpResponse.json(MatchingLeadResponse)
      )
    );

    render(
      <MatchingLeadData leadId="leads/00000000-0000-0000-0000-000000000000" />
    );
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    expect(screen.getByTestId('matching-leads-data')).toBeInTheDocument();
    expect(screen.getByTestId('matching-lead-response')).toBeInTheDocument();
    expect(
      screen.getByTestId(
        'matching-lead-leads/06855dca-4233-4934-9b3d-79aed32982ec'
      )
    ).toBeInTheDocument();
  });
});
