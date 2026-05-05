import { clone } from 'lodash';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import LeadInfo from '.';

var mockSnackbar: jest.Mock;

jest.mock('utils/snackbar', () => {
  mockSnackbar = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockSnackbar,
  });
});

const initialState = {
  leadsDetailReducer: {
    lead: { payload: { name: 'leads/leadId', type: 'LEAD_TYPE_RENEWAL' } },
  },
};

describe.skip('LeadInfo', () => {
  it('should show error snackbar if fetch fail', async () => {
    server.use(
      http.get(getApiEndpoint('/v1alpha1/leads/leadId/originOrder'), () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    render(<LeadInfo headerSection={<div>Header</div>} />, { initialState });
    await waitFor(() => expect(mockSnackbar).toHaveBeenCalled());
  });

  it('should call original order if useGff for original order link is on and lead is renewal', async () => {
    server.use(
      http.get(getApiEndpoint('/v1alpha1/leads/leadId/originOrder'), () =>
        HttpResponse.json({
          url: 'url',
          originShortId: 'shortID',
        })
      )
    );
    render(<LeadInfo headerSection={<div>Header</div>} />, { initialState });
    await waitFor(() =>
      expect(screen.getByText('shortID')).toBeInTheDocument()
    );
  });

  it('should not call order if lead is not renewal', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.get(getApiEndpoint('/v1alpha1/leads/leadId/originOrder'), () =>
        mockHandler()
      )
    );

    const mockInitialState = clone(initialState);
    mockInitialState.leadsDetailReducer.lead.payload.type = 'LEAD_TYPE_NEW';
    render(<LeadInfo headerSection={<div>Header</div>} />, {
      initialState: mockInitialState,
    });
    expect(
      screen.queryByText('leadDetailFields.originalOrder')
    ).not.toBeInTheDocument();
    await waitFor(() => expect(mockHandler).not.toHaveBeenCalled());
  });
});
