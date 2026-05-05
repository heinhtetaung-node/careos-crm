import UserRoles from '@alphafounders/mock-data/json/userRoles.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import TeamModal from '.';

describe('TeamModal', () => {
  it('should render the component and trigger close when close button is clicked', async () => {
    const mockCloseFn = jest.fn();
    render(
      <TeamModal data={null} close={mockCloseFn} setShouldFetch={jest.fn()} />
    );

    expect(screen.getByTestId('team-modal-new')).toBeInTheDocument();

    const cancelButton = screen.getByTestId('cancel-button');
    const submitButton = screen.getByTestId('submit-button');

    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await userEvent.click(cancelButton);
    expect(mockCloseFn).toHaveBeenCalled();
  });

  it.skip('should prepopulate existing data', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'api/team/v1alpha1/teams/25b269b8-23a1-4359-b3fc-fe375c60f1b6'
        ),
        () =>
          HttpResponse.json({
            name: 'teams/25b269b8-23a1-4359-b3fc-fe375c60f1b6',
            createTime: '2023-10-02T08:48:41.067802Z',
            updateTime: '2023-10-09T04:09:49.591813Z',
            deleteTime: null,
            createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
            displayName: 'A BC DEF G HI JK',
            productType: 'products/car-insurance',
            leadType: 'new',
            manager: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
            supervisor: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
            insurers: [],
            role: 'roles/sales',
          })
      ),
      http.get(getApiEndpoint('/api/team/v1alpha1/roles'), () =>
        HttpResponse.json({
          roles: UserRoles,
          nextPageToken: '',
        })
      ),
      http.get(getApiEndpoint('/api/user/v1alpha1/users'), ({ params }) => {
        const filterParam =
          typeof params.filter === 'string' ? params.filter : '';
        const roleReg = /role="([^"]+)"/;
        const roleMatch = roleReg.exec(decodeURIComponent(filterParam));
        if (roleMatch) {
          const role = roleMatch[1];

          if (role === 'roles/manager') {
            return HttpResponse.json({
              users: [
                {
                  name: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
                  createTime: '2022-01-07T12:42:17.917412Z',
                  updateTime: '2023-03-14T07:29:40.833299Z',
                  deleteTime: null,
                  createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
                  humanId: 'QaTestASS2@gmail.com',
                  role: 'roles/manager',
                  firstName: 'QA Manager',
                  lastName: '-',
                  annotations: {},
                  loginTime: '2023-03-14T07:29:40.831600Z',
                },
              ],
              nextPageToken: '',
            });
          }
          return HttpResponse.json({
            users: [
              {
                name: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
                createTime: '2022-01-07T12:42:18.010045Z',
                updateTime: '2023-05-18T10:25:05.513119Z',
                deleteTime: null,
                createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
                humanId: 'QaTestASS3@gmail.com',
                role: 'roles/supervisor',
                firstName: 'QA Supervisor',
                lastName: '-',
                annotations: {},
                loginTime: '2023-05-18T10:25:05.511815Z',
              },
            ],
            nextPageToken: '',
          });
        }

        return HttpResponse.json({
          users: [],
          nextPageToken: '',
        });
      })
    );

    const fakeData = {
      name: 'teams/25b269b8-23a1-4359-b3fc-fe375c60f1b6',
      leadType: 'new' as any,
      productType: 'products/car-insurance' as any,
      manager: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
      managerFirstName: 'QA Manager',
      managerLastName: '-',
      managerFullName: 'QA Manager -',
      supervisor: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
      supervisorFirstName: 'QA Supervisor',
      supervisorLastName: '-',
      supervisorFullName: 'QA Supervisor -',
      createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
      createByFirstName: 'Udgar',
      createByLastName: 'Bhasu',
      createByFullName: 'Udgar Bhasu',
      memberCount: 0,
      displayName: 'A BC DEF G HI JK',
      createTime: '2023-10-02T08:48:41.067802Z',
      updateTime: '2023-10-09T04:09:49.591813Z',
      deleteTime: null,
    };

    render(
      <TeamModal data={fakeData} close={jest.fn()} setShouldFetch={jest.fn()} />
    );

    expect(screen.getByTestId('team-modal-new')).toBeInTheDocument();

    const teamRoleAutocomplete = screen.getByTestId('teamRole-autocomplete');
    const teamRoleInput = within(teamRoleAutocomplete).getByRole('textbox', {
      name: 'text.teamRole',
    });

    const teamNameInputContainer = screen.getByTestId('teamName-input');
    const teamNameInput = within(teamNameInputContainer).getByRole('textbox');

    await waitFor(() => {
      expect(teamRoleInput).toBeDisabled();
      expect(teamNameInput).toHaveValue('A BC DEF G HI JK');
    });

    const cancelButton = screen.getByTestId('cancel-button');
    const submitButton = screen.getByTestId('submit-button');

    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await userEvent.type(teamNameInput, 'LOL');
    await userEvent.keyboard('{Enter}');

    expect(submitButton).toBeEnabled();
  });

  // FIXME: This test is failing because of the way we are handling the autocomplete component
  it.skip('should allow user to create a new team', async () => {
    const mockSaveCall = jest.fn();

    server.use(
      http.get(getApiEndpoint('/api/team/v1alpha1/roles'), () =>
        HttpResponse.json({
          roles: UserRoles,
          nextPageToken: '',
        })
      ),
      http.get(getApiEndpoint('/api/user/v1alpha1/users'), ({ params }) => {
        const filterParam =
          typeof params.filter === 'string' ? params.filter : '';
        const roleReg = /role="([^"]+)"/;
        const roleMatch = roleReg.exec(decodeURIComponent(filterParam));
        if (roleMatch) {
          const role = roleMatch[1];

          if (role === 'roles/manager') {
            return HttpResponse.json({
              users: [
                {
                  name: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
                  createTime: '2022-01-07T12:42:17.917412Z',
                  updateTime: '2023-03-14T07:29:40.833299Z',
                  deleteTime: null,
                  createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
                  humanId: 'QaTestASS2@gmail.com',
                  role: 'roles/manager',
                  firstName: 'QA Manager',
                  lastName: '-',
                  annotations: {},
                  loginTime: '2023-03-14T07:29:40.831600Z',
                },
              ],
              nextPageToken: '',
            });
          }
          return HttpResponse.json({
            users: [
              {
                name: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
                createTime: '2022-01-07T12:42:18.010045Z',
                updateTime: '2023-05-18T10:25:05.513119Z',
                deleteTime: null,
                createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
                humanId: 'QaTestASS3@gmail.com',
                role: 'roles/supervisor',
                firstName: 'QA Supervisor',
                lastName: '-',
                annotations: {},
                loginTime: '2023-05-18T10:25:05.511815Z',
              },
            ],
            nextPageToken: '',
          });
        }

        return HttpResponse.json({
          users: [],
          nextPageToken: '',
        });
      }),
      http.post(
        getApiEndpoint('/api/team/v1alpha1/teams'),
        async ({ request }) =>
          HttpResponse.json(mockSaveCall(await request.json()))
      )
    );

    render(
      <TeamModal data={null} close={jest.fn()} setShouldFetch={jest.fn()} />
    );

    expect(screen.getByTestId('team-modal-new')).toBeInTheDocument();

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();

    const teamRoleAutocomplete = within(
      screen.getByTestId('teamRole-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(teamRoleAutocomplete);

    await waitFor(async () => {
      const allOptions = within(screen.getByRole('presentation')).getAllByRole(
        'option'
      );
      await userEvent.click(allOptions[0]);
    });

    const teamNameInputContainer = screen.getByTestId('teamName-input');
    const teamNameInput = within(teamNameInputContainer).getByRole('textbox');
    await userEvent.type(teamNameInput, 'LOL');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(teamNameInput).toHaveValue('LOL');
      expect(submitButton).toBeDisabled();
    });

    const ProductAutocomplete = within(
      screen.getByTestId('product-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(ProductAutocomplete);

    await waitFor(async () => {
      const allOptions = within(screen.getByRole('presentation')).getAllByRole(
        'option'
      );
      await userEvent.click(allOptions[0]);
    });

    const LeadTypeAutocomplete = within(
      screen.getByTestId('leadType-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(LeadTypeAutocomplete);

    await waitFor(async () => {
      const allOptions = within(screen.getByRole('presentation')).getAllByRole(
        'option'
      );
      await userEvent.click(allOptions[0]);
    });

    const ManagerAutocomplete = within(
      screen.getByTestId('manager-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(ManagerAutocomplete);

    await waitFor(async () => {
      const allOptions = within(screen.getByRole('presentation')).getAllByRole(
        'option'
      );
      await userEvent.click(allOptions[0]);
    });

    const SupervisorAutocomplete = within(
      screen.getByTestId('supervisor-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(SupervisorAutocomplete);

    await waitFor(async () => {
      const allOptions = within(screen.getByRole('presentation')).getAllByRole(
        'option'
      );
      await userEvent.click(allOptions[0]);
    });

    expect(submitButton).toBeEnabled();
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSaveCall).toHaveBeenNthCalledWith(1, {
        displayName: 'LOL',
        insurers: [],
        leadType: 'new',
        manager: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
        productType: 'products/car-insurance',
        role: 'roles/sales',
        supervisor: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
      });
    });
  });
});
