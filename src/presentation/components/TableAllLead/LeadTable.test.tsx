import leadSearchApiMock from '@alphafounders/mock-data/json/leadSearchApiMock.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import getApiEndpoint from 'utils/endpointHelper';

import LeadTable from './LeadTable';

describe.skip('LeadTable', () => {
  test('should render all part', () => {
    render(
      <LeadTable
        tableType={TABLE_LEAD_TYPE.LEAD_ALL}
        searchValue={{} as any}
      />,
      {
        initialState: {
          leadsReducer: {
            leadParticipantReducers: {},
            leadRecordingReducers: {},
          },
        },
      }
    );
    expect(screen.getByTestId('lead-table')).toBeInTheDocument();
  });

  test('should call api with appropriate search param when next page is clicked', async () => {
    const mockHandler = jest
      .fn()
      .mockReturnValue({ ...leadSearchApiMock.leadSearchResponse, total: 30 });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable tableType={TABLE_LEAD_TYPE.LEAD_ALL} searchValue={{} as any} />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    mockHandler.mockClear();
    await userEvent.click(
      within(screen.getAllByTestId('pagination')[0]).getByRole('button', {
        name: 'Go to page 2',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        'filter=&page_from=15&page_size=15&order_by=lead.createTime+desc'
      )
    );
  });

  test('should call api with appropriate search param when page size change', async () => {
    const mockHandler = jest
      .fn()
      .mockReturnValue({ ...leadSearchApiMock.leadSearchResponse, total: 30 });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable
        tableType={TABLE_LEAD_TYPE.LEAD_ASSIGNMENT}
        searchValue={{} as any}
      />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    mockHandler.mockClear();
    await userEvent.click(
      within(screen.getAllByTestId('pagination')[0]).getByRole('button', {
        name: '15',
      })
    );
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: '25',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        'filter=lead.status%21%3D%22LEAD_STATUS_PURCHASED%22+lead.isRejected%21%3Dtrue&page_size=25&order_by=lead.name'
      )
    );
  });

  test('should call api with appropriate search param when sorting change', async () => {
    const mockHandler = jest
      .fn()
      .mockReturnValue({ ...leadSearchApiMock.leadSearchResponse, total: 30 });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable tableType={TABLE_LEAD_TYPE.LEAD_ALL} searchValue={{} as any} />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    mockHandler.mockClear();
    await userEvent.click(
      within(screen.getByTestId('table-header')).getByRole('button', {
        name: 'Text.updatedon',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        'filter=&page_size=15&order_by=lead.updateTime'
      )
    );
  });

  test('should select all rows if select all is clicked', async () => {
    const mockHandler = jest
      .fn()
      .mockReturnValue({ ...leadSearchApiMock.leadSearchResponse, total: 30 });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable
        tableType={TABLE_LEAD_TYPE.LEAD_REJECTION}
        searchValue={{} as any}
      />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    mockHandler.mockClear();
    await userEvent.click(
      within(screen.getByTestId('table-header')).getByRole('checkbox')
    );
    within(screen.getByTestId('table-body'))
      .getAllByRole('checkbox', {
        name: '',
      })
      .forEach((checkbox) => expect(checkbox).toBeChecked());
    await userEvent.click(
      within(screen.getByTestId('table-header')).getByRole('checkbox')
    );
    within(screen.getByTestId('table-body'))
      .getAllByRole('checkbox', {
        name: '',
      })
      .forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });

  test.skip('selecting the individual rows', async () => {
    const mockHandler = jest.fn().mockReturnValue({
      leads: [
        ...leadSearchApiMock.leadSearchResponse.leads,
        {
          ...leadSearchApiMock.leadSearchResponse.leads[0],
          lead: {
            ...leadSearchApiMock.leadSearchResponse.leads[0].lead,
            name: 'asdf-asdf-asdf',
          },
        },
      ],
      total: 30,
    });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable
        tableType={TABLE_LEAD_TYPE.LEAD_ASSIGNMENT}
        searchValue={{} as any}
      />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    mockHandler.mockClear();
    const selectAllCheckBox = within(
      screen.getByTestId('table-header')
    ).getByRole('checkbox');

    within(screen.getByTestId('table-body'))
      .getAllByRole('checkbox', {
        name: '',
      })
      .forEach((checkbox) => {
        expect(selectAllCheckBox).not.toBeChecked();
        userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
      });
    await waitFor(() => expect(selectAllCheckBox).toBeChecked());
    within(screen.getByTestId('table-body'))
      .getAllByRole('checkbox', {
        name: '',
      })
      .forEach((checkbox) => {
        userEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(selectAllCheckBox).not.toBeChecked();
      });
  });

  test('handle voice modal', async () => {
    const mockHandler = jest
      .fn()
      .mockReturnValue({ ...leadSearchApiMock.leadSearchResponse, total: 30 });
    server.use(
      http.get(
        getApiEndpoint('/api/lead-search/v1alpha1/search'),
        ({ params }) => HttpResponse.json(mockHandler(params.toString()))
      )
    );
    render(
      <LeadTable
        tableType={TABLE_LEAD_TYPE.LEAD_REJECTION}
        searchValue={{} as any}
      />
    );
    await waitForElementToBeRemoved(screen.getByTestId('table-skeleton'));
    await userEvent.click(screen.getByTestId('voice-modal-btn'));
    expect(
      within(screen.getByRole('presentation')).getByText('text.voiceFile')
    ).toBeInTheDocument();
  });
});
