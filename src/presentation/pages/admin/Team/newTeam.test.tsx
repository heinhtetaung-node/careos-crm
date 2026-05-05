import TeamsResponse from '@alphafounders/mock-data/json/teamListGenericSearch.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import Team from './newTeam';

describe.skip('Teams page', () => {
  it('calls new api to fetch teams', async () => {
    const mockApiHandler = jest.fn((args) => args);
    server.use(
      http.get(
        getApiEndpoint('api/lead-search/v1alpha1/search/teams'),
        async ({ request }) =>
          HttpResponse.json(mockApiHandler(await request.json()))
      )
    );

    render(<Team />);
    expect(screen.getByTestId('admin-new-team-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiHandler).toHaveBeenCalledTimes(1);
    });
  });

  it('populates data from api response', async () => {
    server.use(
      http.get(getApiEndpoint('api/lead-search/v1alpha1/search/teams'), (_) =>
        HttpResponse.json(TeamsResponse)
      )
    );

    render(<Team />);
    expect(screen.getByTestId('admin-new-team-page')).toBeInTheDocument();
    const TopComponent = screen.getByTestId('team-top-pagination-component');
    expect(TopComponent).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByTestId('pagination-total-label')).toHaveLength(2);
      expect(
        screen.getAllByTestId('pagination-total-label')[0]
      ).toHaveTextContent('of 1537');
    });
  });

  it.skip('calls user service when clicked on manager or supervisor filter', async () => {
    const mockManagerApiHandler = jest.fn((args) => args);
    const mockSupervisorApiHandler = jest.fn((args) => args);

    server.use(
      http.get(
        getApiEndpoint('/api/teams/lookup/managers', ServicesName.NODE),
        async ({ request }) =>
          HttpResponse.json(mockManagerApiHandler(await request.json()))
      ),
      http.get(
        getApiEndpoint('/api/teams/lookup/supervisors', ServicesName.NODE),
        async ({ request }) =>
          HttpResponse.json(mockSupervisorApiHandler(await request.json()))
      )
    );

    render(<Team />);
    const managerAutocomplete = screen.getByTestId(
      'manager-filter-autocomplete'
    );

    const supervisorAutocomplete = screen.getByTestId(
      'supervisor-filter-autocomplete'
    );

    expect(managerAutocomplete).toBeInTheDocument();
    expect(supervisorAutocomplete).toBeInTheDocument();

    const managerDropdown = within(managerAutocomplete).getByRole('button');

    expect(managerDropdown).toBeInTheDocument();

    await userEvent.click(managerDropdown);

    await waitFor(() => {
      expect(mockManagerApiHandler).toHaveBeenCalled();
    });

    const supervisorDropdown = within(supervisorAutocomplete).getByRole(
      'button'
    );

    expect(supervisorDropdown).toBeInTheDocument();

    await userEvent.click(supervisorDropdown);

    await waitFor(() => {
      expect(mockSupervisorApiHandler).toHaveBeenCalled();
    });
  });

  // FIX ME
  it.skip('calls teams api when user applies filter', async () => {
    const mockApiHandler = jest.fn((args) => args);

    server.use(
      http.get(
        getApiEndpoint('api/lead-search/v1alpha1/search/teams'),
        async ({ request }) => HttpResponse.json(mockApiHandler(request))
      )
    );

    render(<Team />);
    const leadTypeAutocomplete = screen.getByTestId(
      'leadType-filter-autocomplete'
    );
    expect(leadTypeAutocomplete).toBeInTheDocument();
    const submitBtn = screen.getByTestId('submit-btn');
    expect(submitBtn).toBeInTheDocument();

    const leadTypeAutocompleteComponent =
      within(leadTypeAutocomplete).getByRole('textbox');
    await userEvent.click(leadTypeAutocompleteComponent);

    await waitFor(() => {
      expect(
        within(screen.getByTestId('common-my-complete__poppers')).getByText(
          'leadTypeFilter.new'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(
      within(screen.getByTestId('common-my-complete__poppers')).getByText(
        'leadTypeFilter.new'
      )
    );

    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockApiHandler).toHaveBeenCalled();
    });
  });

  it('renders team modal when create team button is clicked', async () => {
    const mockApiHandler = jest.fn((args) => args);

    server.use(
      http.get(
        getApiEndpoint('api/lead-search/v1alpha1/search/teams'),
        async ({ request }) => HttpResponse.json(mockApiHandler(request))
      )
    );

    render(<Team />);

    const createTeamButton = screen.getByTestId('create-team-button');
    expect(createTeamButton).toBeInTheDocument();
    await userEvent.click(createTeamButton);
    expect(screen.getByTestId('common-modal-component')).toBeInTheDocument();
  });
});
