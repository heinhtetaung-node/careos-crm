import UserRoles from '@alphafounders/mock-data/json/userRoles.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import UsersV2 from './UserV2';

var mockDownload: jest.Mock;

jest.mock('presentation/hooks/useTableList', () =>
  jest.fn().mockReturnValue({
    TableComponent: 'Table',
    TopComponent: 'Top',
  })
);

jest.mock('data/slices/leadSearchSlice', () => ({
  ...jest.requireActual('data/slices/leadSearchSlice'),
  useLazyGenericSearchQuery: jest
    .fn()
    .mockResolvedValue({ data: { users: ['1'], total: 1 } }),
}));
jest.mock('../../../redux/reducers/admin/user/listUser/index', () => ({
  ...jest.requireActual('../../../redux/reducers/admin/user/listUser/index'),
  formatUserList: jest.fn(),
}));
jest.mock('data/slices/gffSlice', () => ({
  ...jest.requireActual('data/slices/gffSlice'),
  useLazySearchUserCreateByQuery: jest.fn(() => ({
    data: { users: [{ name: 'name', displayName: 'dname' }] },
  })),
}));

jest.mock('./userPageHelper', () => {
  mockDownload = jest.fn();
  return {
    ...jest.requireActual('./userPageHelper'),
    download: mockDownload,
  };
});

describe.skip('User page', () => {
  it('renders component', async () => {
    render(<UsersV2 />);
    expect(
      screen.getByRole('button', { name: 'text.addUser' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.importedUser' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.templateButton' })
    ).toBeInTheDocument();
  });

  it('should show create user model on click', async () => {
    render(<UsersV2 />);
    await userEvent.click(screen.getByRole('button', { name: 'text.addUser' }));
    const model = screen.getByRole('presentation');
    expect(within(model).getByText('text.addUser')).toBeInTheDocument();
    await userEvent.click(
      within(model).getByRole('button', { name: 'text.cancelButton' })
    );
  });

  it('should show import model on click', async () => {
    render(<UsersV2 />, {
      initialState: {
        userReducer: { importUserReducer: { importUserSuccess: 'success' } },
      },
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'text.importedUser' })
    );
    const model = screen.getAllByRole('presentation')[0];
    expect(within(model).getByText('text.importedUser')).toBeInTheDocument();
    await userEvent.click(
      within(model).getByRole('button', { name: 'text.cancelButton' })
    );
  });

  it('should download template on template button click', async () => {
    render(<UsersV2 />);
    await userEvent.click(
      screen.getByRole('button', { name: 'text.templateButton' })
    );
    await waitFor(() => expect(mockDownload).toHaveBeenCalled());
  });

  it('should call api expend', async () => {
    render(<UsersV2 />);
    const autocomplete = screen.getByTestId('create-by-autocomplete');
    await userEvent.click(within(autocomplete).getByRole('button'));
    await waitFor(() =>
      expect(
        within(screen.getByRole('presentation')).getByText('dname')
      ).toBeInTheDocument()
    );
  });

  it('calls user roles api when clicked on user role dropdown', async () => {
    const mockApiHandler = jest.fn((args) => args);
    server.use(
      http.get(
        getApiEndpoint('api/user/v1alpha1/roles'),
        async ({ request }) => {
          mockApiHandler(await request.json());
          return HttpResponse.json({
            roles: UserRoles,
            nextPageToken: '',
          });
        }
      )
    );

    render(<UsersV2 />);
    const autocomplete = screen.getByTestId('user-role-autocomplete');
    await userEvent.click(within(autocomplete).getByRole('button'));

    await waitFor(() => {
      expect(mockApiHandler).toHaveBeenCalledTimes(1);
      expect(
        within(screen.getByRole('presentation')).getByText('Admin')
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole('presentation')).getByText('Migrated Agent')
      ).toBeInTheDocument();
    });
  });
});
