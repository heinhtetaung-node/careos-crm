import leadSearchResponse from '@alphafounders/mock-data/json/leadSearchApiMock.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import MyLeadsListingPage from '.';

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

describe('MyLeads Listing page', () => {
  beforeEach(() => {
    server.use(
      http.get(getApiEndpoint('/api/lead-search/v1alpha1/search'), () =>
        HttpResponse.json(leadSearchResponse.leadSearchMultipleResponse)
      ),
      http.get(
        getApiEndpoint(
          'api/reject/v1alpha1/leads/1aa5f13e-c820-4123-ba83-6bd56ffc8916/rejections'
        ),
        () =>
          HttpResponse.json({
            data: { rejection: [] },
            error: false,
            isLoading: true,
          })
      ),
      http.get(getApiEndpoint('api/team/v1alpha1/teams/-/members'), () =>
        HttpResponse.json({
          members: [
            {
              createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
              createTime: null,
              deleteTime: null,
              name: 'teams/a63ae43f-2996-4c18-b391-8bb0022a8ebf/members/ab53b79a-2efc-44b7-b2a2-ed0e6d78f339',
              updateTime: null,
              user: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
            },
          ],
          nextPageToken: '',
        })
      ),
      http.get(
        getApiEndpoint(
          'api/team/v1alpha1/teams/a63ae43f-2996-4c18-b391-8bb0022a8ebf'
        ),
        () =>
          HttpResponse.json({
            name: 'teams/a63ae43f-2996-4c18-b391-8bb0022a8ebf',
            createTime: '2022-01-08T04:33:40.679413Z',
            updateTime: '2022-01-08T04:33:40.679413Z',
            deleteTime: null,
            createBy: 'users/1d8b07d6-224e-444b-9409-baff32b5866b',
            displayName: 'Car Team Test 8',
            productType: 'products/car-insurance',
            leadType: 'new',
            manager: 'users/89fd9ac7-7162-456f-b472-c80c247acd54',
            supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
            insurers: [],
            role: 'roles/sales',
          })
      )
    );

    render(<MyLeadsListingPage />, {
      initialState,
    });

    expect(screen.getByTestId('my-leads-listing')).toBeInTheDocument();
  });

  test('renders the my leads listing page correctly when feature flags are on', async () => {
    const mainContainer = screen.getByTestId('my-leads-listing');
    const filterPanel = within(mainContainer).getByTestId(
      'my-leads-filter-panel'
    );
    expect(filterPanel).toBeInTheDocument();
    expect(
      within(mainContainer).getByTestId('muiSelect-renewalPackageStatus')
    ).toBeInTheDocument();
    expect(
      within(mainContainer).getByTestId('muiSelect-sundayContactable')
    ).toBeInTheDocument();

    const tableHead = within(mainContainer).getByTestId('table-head');
    expect(tableHead).toBeInTheDocument();
    expect(tableHead.querySelector('tr')?.children.length).toBe(21);
    expect(screen.getByTestId('lead-type-autocomplete')).toBeInTheDocument();
  });

  test('renders the my leads listing page correctly when feature flags are off', async () => {
    const mainContainer = screen.getByTestId('my-leads-listing');
    const filterPanel = within(mainContainer).getByTestId(
      'my-leads-filter-panel'
    );
    expect(filterPanel).toBeInTheDocument();
    expect(
      within(mainContainer).getByTestId('muiSelect-renewalPackageStatus')
    ).toBeInTheDocument();
    const tableHead = within(mainContainer).getByTestId('table-head');
    expect(tableHead).toBeInTheDocument();
    expect(screen.getByTestId('lead-type-autocomplete')).toBeInTheDocument();
  });

  // FIX ME: This test is failing
  test.skip('should call update lead api when user click on important icon', async () => {
    const mainContainer = screen.getByTestId('my-leads-listing');
    const tableContainer =
      within(mainContainer).getByTestId('myLeads-dataTable');
    expect(tableContainer).toBeInTheDocument();

    const addStarBtn = screen.getByTestId('add-star-btn');
    const removeStarBtn = screen.getByTestId('remove-star-btn');

    expect(addStarBtn).toBeInTheDocument();
    expect(removeStarBtn).toBeInTheDocument();
    expect(addStarBtn).toBeDisabled();
    expect(removeStarBtn).toBeDisabled();

    const tableRows = within(tableContainer).getAllByTestId('myLead-table-row');
    expect(tableRows.length).toBe(15);

    await waitFor(async () => {
      const allCheckboxes = screen.getAllByTestId('myLead-table-row-checkbox');
      expect(allCheckboxes[0]).toBeInTheDocument();
      await userEvent.click(allCheckboxes[0].querySelector('input')!);
    });

    await waitFor(() => {
      expect(addStarBtn).toBeEnabled();
      expect(removeStarBtn).toBeDisabled();
    });

    await userEvent.click(addStarBtn);
  });
});
