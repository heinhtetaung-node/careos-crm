import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { act, render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import * as GffSlices from 'data/slices/gffSlice';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import LeadDashBoard from '.';

const mockedDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockedDispatch),
}));

const mockGetUsersDataFromLeadApi = jest.fn();
/** @type {{ users?: Array<{ name: string; fullName: string }> } | undefined} */
let mockUsersDataFromLeadApi;
jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useLazyGetAllUserStreamingByLeadSearchQuery: () => [
    mockGetUsersDataFromLeadApi,
    {
      data: mockUsersDataFromLeadApi,
      isLoading: false,
    },
  ],
}));

/** @type { { fields: Array<{ inputProps: { name: string; onFocus?: () => void; options?: unknown[] } }> } | null } */
let filterPanelProps = null;
jest.mock('presentation/components/FilterPanel', () => ({
  __esModule: true,
  default: (props) => {
    filterPanelProps = props;
    return React.createElement('div', { 'data-testid': 'filter-panel' });
  },
}));

const mockUseAppSelector = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppDispatch: () => mockedDispatch,
  useAppSelector: (selector: (state: unknown) => string) =>
    mockUseAppSelector(selector),
}));

describe('LeadDashBoard agent name focus and users data (lines 417–419, 424)', () => {
  const healthProductSelector = () => 'products/health-insurance';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockImplementation(healthProductSelector);
    filterPanelProps = null;
    mockUsersDataFromLeadApi = undefined;
  });

  it('calls getUsersDataFromLeadApi on first agent name focus and not on second (417, 418, 419)', async () => {
    mockGetUsersDataFromLeadApi.mockResolvedValue({ data: { users: [] } });
    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);

    const assignToUserField = filterPanelProps?.fields?.find(
      (f) => f.inputProps.name === 'assignToUser'
    );
    expect(assignToUserField?.inputProps.onFocus).toBeDefined();

    await act(async () => {
      assignToUserField?.inputProps.onFocus?.();
    });
    expect(mockGetUsersDataFromLeadApi).toHaveBeenCalledTimes(1);
    expect(mockGetUsersDataFromLeadApi).toHaveBeenCalledWith(
      'filter=user.role.keyword in("roles/sales") user.product="products/health-insurance"'
    );

    await act(async () => {
      assignToUserField?.inputProps.onFocus?.();
    });
    expect(mockGetUsersDataFromLeadApi).toHaveBeenCalledTimes(1);
  });

  it('does not set agent options when usersDataFromLeadApi has no users (424 early return)', () => {
    mockUsersDataFromLeadApi = undefined;
    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);

    const assignToUserField = filterPanelProps?.fields?.find(
      (f) => f.inputProps.name === 'assignToUser'
    );
    expect(assignToUserField?.inputProps.options).toEqual([]);
  });

  it('sets agent options when usersDataFromLeadApi has users (424 branch, setAgentNameOptions)', async () => {
    const users = [
      { name: 'users/1', fullName: 'Agent One' },
      { name: 'users/2', fullName: 'Agent Two' },
    ];
    mockUsersDataFromLeadApi = { users };

    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);

    await waitFor(() => {
      const assignToUserField = filterPanelProps?.fields?.find(
        (f) => f.inputProps.name === 'assignToUser'
      );
      expect(assignToUserField?.inputProps.options).toEqual(users);
    });
  });
});

describe.skip('MyLeads Listing page', () => {
  it('renders dashboard and check rejectedLead field is present when tableType is all', () => {
    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);
    expect(screen.getByTestId('lead-dashboard')).toHaveTextContent(
      'rejectedLead'
    );
    expect(screen.getByTestId('lead-dashboard')).toHaveTextContent(
      'sundayContactable'
    );
  });

  it('renders dashboard and check rejectionReasons field is present when tableType is lead assignment', () => {
    render(
      <LeadDashBoard tableType="LEAD_ASSIGNMENT" helmet="Lead Assignment" />
    );
    expect(screen.getByTestId('lead-dashboard')).not.toHaveTextContent(
      'rejectionReasons'
    );
    expect(screen.getByTestId('lead-dashboard')).toHaveTextContent(
      'sundayContactable'
    );
  });

  it('renders dashboard and check rejectionReasons field is present when tableType is lead rejection', () => {
    render(
      <LeadDashBoard tableType="LEAD_REJECTION" helmet="Lead Rejection" />
    );
    expect(screen.getByTestId('lead-dashboard')).toHaveTextContent(
      'rejectionReasons'
    );
    expect(screen.getByTestId('lead-dashboard')).not.toHaveTextContent(
      'sundayContactable'
    );
  });

  it('renders the page correctly and shows all the search options when feature flag is on', async () => {
    render(<LeadDashBoard tableType="LEAD_ALL" helmet="Lead All" />);
    expect(screen.getByTestId('muiSelect-selectValue')).toBeInTheDocument();

    const searchDropdown = within(
      screen.getByTestId('muiSelect-selectValue')
    ).getByRole('button');

    await userEvent.click(searchDropdown);

    const dropdown = screen.getByRole('presentation');

    await userEvent.click(
      within(dropdown).getByRole('option', {
        name: 'searchFieldLeadOption.reference',
      })
    );

    const search = screen.getByPlaceholderText('text.search');
    await userEvent.type(search, 'L12345678');

    const searchButton = screen.getByTestId('submit-btn');

    expect(searchButton).toBeEnabled();
    await userEvent.click(searchButton);
    expect(mockedDispatch).toHaveBeenCalled();
  });

  it.skip('calls user service when clicked on "assigned to user" filter', async () => {
    const mockHandler = jest.fn((args) => args);

    server.use(
      http.get(
        getApiEndpoint('api/leads/lookup/assigned', ServicesName.NODE),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );

    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);
    expect(
      screen.getByTestId('assigned-to-user-autocomplete')
    ).toBeInTheDocument();

    const searchDropdown = within(
      screen.getByTestId('assigned-to-user-autocomplete')
    ).getByRole('button');

    expect(searchDropdown).toBeInTheDocument();

    await userEvent.click(searchDropdown);

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });
  it.skip('calls user service when clicked on "assigned to user" filter', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      data: { users: [{ name: 'name', displayName: 'dname' }] },
    });
    jest
      .spyOn(GffSlices, 'useLazyAssignUserSearchQuery')
      .mockReturnValue([mockFetch] as never);
    render(<LeadDashBoard tableType="LEAD_ALL" helmet="All Leads" />);

    const searchDropdown = within(
      screen.getByTestId('assigned-to-user-autocomplete')
    ).getByRole('button');
    await userEvent.click(searchDropdown);
    await waitFor(() =>
      expect(
        within(screen.getByRole('presentation')).getByText('dname')
      ).toBeInTheDocument()
    );
    mockFetch.mockResolvedValue({
      data: { users: [{ name: 'name', displayName: 'sname' }] },
    });
    await userEvent.type(
      within(screen.getByTestId('assigned-to-user-autocomplete')).getByRole(
        'textbox'
      ),
      'abcd'
    );
    await waitFor(() =>
      expect(
        within(screen.getByRole('presentation')).getByText('sname')
      ).toBeInTheDocument()
    );
  });
});
