import UserRoles from '@alphafounders/mock-data/json/userRoles.json';
import { act, waitFor } from '@testing-library/react';
import { renderHook, cleanup } from '@testing-library/react-hooks';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import {
  useGetRolesQuery,
  useGetTeamsQuery,
  useGetTeamDetailQuery,
  useAddTeamMutation,
  useUpdateTeamMutation,
  useAddMemberToTeamMutation,
  useLazyGetTeamMembersQuery,
  useMoveMemberToTeamMutation,
  useDeleteMemberFromTeamMutation,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const teams = [
  {
    name: 'teams/d1fbd678-80cb-4432-8b05-304f261e4704',
    createTime: '2023-05-23T06:16:22.955653Z',
    updateTime: '2023-05-31T06:55:38.878127Z',
    deleteTime: null,
    createBy: 'users/8c748759-bd15-4ed8-8697-cec40cb9cbad',
    displayName: 'Auto assign',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/ebfb9a52-b1f5-4b1c-9c06-3eadade95219',
    supervisor: 'users/f7919946-c885-49d5-9f27-d189d528909f',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/df46f172-357d-485d-ad1f-7c9d06e1564d',
    createTime: '2022-03-07T13:07:06.836041Z',
    updateTime: '2022-03-07T13:07:06.836041Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    displayName: 'Automation BE Test',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/9fac07fb-c04e-48f1-8fdd-e176d0cf2f58',
    supervisor: 'users/9169ba87-8870-4602-8193-f3635b357760',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/6aab4a68-0a1e-472d-81ba-1e527a863088',
    createTime: '2022-03-07T13:13:45.153305Z',
    updateTime: '2022-03-07T14:20:35.476782Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    displayName: 'Automation BE Test + 123',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/f5e824de-0eeb-42b9-9b32-f8eea16ac6fa',
    supervisor: 'users/b020c48a-f4c1-42bb-935b-c9c7cec3f917',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/82e56d9f-3705-47b8-b2df-b104de6604c1',
    createTime: '2022-03-08T05:36:30.778449Z',
    updateTime: '2022-03-08T05:36:30.778449Z',
    deleteTime: null,
    createBy: 'users/0af2ca50-7733-4ba7-86e8-6477ca21bd17',
    displayName: 'Automation BE Test + 16',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/9fac07fb-c04e-48f1-8fdd-e176d0cf2f58',
    supervisor: 'users/9169ba87-8870-4602-8193-f3635b357760',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/72315bd6-94bb-43f4-bfe3-baddab7cab06',
    createTime: '2022-03-08T05:36:28.668685Z',
    updateTime: '2022-03-08T05:36:28.668685Z',
    deleteTime: null,
    createBy: 'users/0af2ca50-7733-4ba7-86e8-6477ca21bd17',
    displayName: 'Automation BE Test + 17',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/9fac07fb-c04e-48f1-8fdd-e176d0cf2f58',
    supervisor: 'users/9169ba87-8870-4602-8193-f3635b357760',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/71b2613f-222e-4d9b-bfee-039245542101',
    createTime: '2022-03-08T09:23:51.248567Z',
    updateTime: '2022-03-08T09:23:51.248567Z',
    deleteTime: null,
    createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
    displayName: 'Automation BE Test2',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/9fac07fb-c04e-48f1-8fdd-e176d0cf2f58',
    supervisor: 'users/9169ba87-8870-4602-8193-f3635b357760',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/98ce8658-e6a1-4305-848a-00833a55dea1',
    createTime: '2022-03-08T09:24:28.953523Z',
    updateTime: '2022-03-08T09:24:28.953523Z',
    deleteTime: null,
    createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
    displayName: 'Automation BE Test3',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/9fac07fb-c04e-48f1-8fdd-e176d0cf2f58',
    supervisor: 'users/9169ba87-8870-4602-8193-f3635b357760',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/03278e19-3424-47c1-804a-f93ab8246e29',
    createTime: '2022-03-07T13:08:34.220664Z',
    updateTime: '2022-03-07T13:13:01.307757Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    displayName: 'Automation BE Test99',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/1fa029a9-781b-4576-ab2c-c725dbcf1855',
    supervisor: 'users/b020c48a-f4c1-42bb-935b-c9c7cec3f917',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/4de40ae5-2547-4080-ae29-f5f644d67364',
    createTime: '2022-11-02T08:26:55.806015Z',
    updateTime: '2022-11-02T08:34:48.726233Z',
    deleteTime: null,
    createBy: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
    displayName: 'Automation Test BE PATCHsales',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/f5e824de-0eeb-42b9-9b32-f8eea16ac6fa',
    supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
    insurers: [],
    role: 'roles/sales',
  },
  {
    name: 'teams/a63ae43f-2996-4c18-b391-8bb0022a8ebf',
    createTime: '2022-01-08T04:33:40.679413Z',
    updateTime: '2022-12-09T09:26:40.536079Z',
    deleteTime: null,
    createBy: 'users/1d8b07d6-224e-444b-9409-baff32b5866b',
    displayName: 'Car Team Test 8',
    productType: 'products/car-insurance',
    leadType: 'new',
    manager: 'users/89fd9ac7-7162-456f-b472-c80c247acd54',
    supervisor: 'users/bb7a1306-5b20-4a30-b279-0a499976d261',
    insurers: [],
    role: 'roles/sales',
  },
];

describe('Test useGetRolesQuery', () => {
  it('should call the getRoles endpoint and return response', async () => {
    server.use(
      http.get(getApiEndpoint('/api/team/v1alpha1/roles'), () =>
        HttpResponse.json({
          UserRoles,
          nextPageToken: 'abcd1234',
        })
      )
    );

    const { result, waitForNextUpdate } = renderHook(
      () => useGetRolesQuery({ pageSize: 5 }),
      {
        wrapper,
      }
    );

    const initialResponse = result.current;
    expect(initialResponse.data).toBeUndefined();
    expect(initialResponse.isLoading).toBeTruthy();

    await waitForNextUpdate();

    const nextResponse = result.current;

    expect(nextResponse.data).toEqual(
      expect.objectContaining({ UserRoles, nextPageToken: 'abcd1234' })
    );
  });
});

describe('Test useGetTeamsQuery', () => {
  it('should call the getTeams endpoint and return response', async () => {
    server.use(
      http.get(getApiEndpoint('/api/team/v1alpha1/teams'), ({ request }) => {
        const url = new URL(request.url);
        const nextPageToken = url.searchParams.get('pageToken');
        if (nextPageToken) {
          return HttpResponse.json({
            teams: teams.slice(5),
            nextPageToken: '',
          });
        }
        return HttpResponse.json({
          teams: teams.slice(0, 5),
          nextPageToken: 'abcd1234',
        });
      })
    );

    const { result, waitForNextUpdate } = renderHook(() => useGetTeamsQuery(), {
      wrapper,
    });

    const initialResponse = result.current;
    expect(initialResponse.data).toBeUndefined();
    expect(initialResponse.isLoading).toBeTruthy();

    await waitForNextUpdate();

    const nextResponse = result.current;
    expect(nextResponse.data).toEqual(teams);
  });
});

describe('Test useGetTeamDetailQuery', () => {
  beforeEach(() => {
    server.use(
      http.get(getApiEndpoint('/api/team/v1alpha1/teams/fakeTeamId'), () =>
        HttpResponse.json(teams[0])
      )
    );
  });

  it('should call the getTeamDetail endpoint and return response', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGetTeamDetailQuery('teams/fakeTeamId'),
      {
        wrapper,
      }
    );

    const initialResponse = result.current;
    expect(initialResponse.data).toBeUndefined();
    expect(initialResponse.isLoading).toBeTruthy();

    await waitForNextUpdate();

    const nextResponse = result.current;

    expect(nextResponse.data).toEqual(teams[0]);
  });
});

describe.skip('Test useAddTeamMutation', () => {
  it('should call add team api to post new team', async () => {
    const teamData = {
      name: '',
      displayName: 'ABCDEFGHIJK',
      productType: 'products/car-insurance',
      leadType: 'new',
      manager: 'users/fakeManagerId',
      supervisor: 'users/fakeSupervisorId',
      role: 'roles/sales',
      insurers: [],
    };

    const mockHandler = jest.fn();

    server.use(
      http.post(
        getApiEndpoint('/api/team/v1alpha1/teams'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );

    const { result } = renderHook(() => useAddTeamMutation({}), {
      wrapper,
    });

    const [addTeam] = result.current;

    await act(async () => {
      await addTeam(teamData);
    });

    expect(mockHandler).toHaveBeenNthCalledWith(1, teamData);

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
  });
});

describe.skip('Test useUpdateTeamMutation', () => {
  it('should call add team api to post new team', async () => {
    const UpdateData = {
      displayName: 'ABCDEFGHIJK',
      insurers: [],
      leadType: 'new',
      manager: 'users/fakeManagerId',
      productType: 'products/car-insurance',
      role: 'roles/sales',
      supervisor: 'users/fakeSupervisorId',
    };

    const mockHandler = jest.fn();
    server.use(
      http.patch(
        getApiEndpoint('/api/team/v1alpha1/:teamResource'),
        async ({ params, request }) => {
          const { teamResource } = params;
          const apiResponse = await request.json();

          return Response.json(mockHandler(apiResponse));
        }
      )
    );

    const { result } = renderHook(() => useUpdateTeamMutation({}), {
      wrapper,
    });

    const [updateTeam] = result.current;

    await act(async () => {
      await updateTeam({
        teamData: UpdateData,
        teamId: 'teams/fakeTeamId',
      });
    });

    expect(mockHandler).toHaveBeenNthCalledWith(1, UpdateData);

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
  });
});

describe.skip('Test useAddMemberToTeamMutation', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should call add member to team api', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.post(
        getApiEndpoint('/api/team/v1alpha1/teams/fakeTeamId/members'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    const { result, waitForValueToChange } = renderHook(
      () => useAddMemberToTeamMutation(),
      {
        wrapper,
      }
    );
    const [addMemberToTeam] = result.current;

    await act(async () => {
      await addMemberToTeam({
        teamId: 'teams/fakeTeamId',
        userData: {
          user: 'users/fakeUserId',
        },
      });
    });

    await waitForValueToChange(() => result.current[1].isLoading === false);

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(mockHandler).toHaveBeenNthCalledWith(1, {
        user: 'users/fakeUserId',
      });
    });
  });
});

describe('Testing useLazyGetTeamMembersQuery', () => {
  it('should call get team members api', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.get(
        getApiEndpoint('/api/team/v1alpha1/teams/-/members'),
        async ({ request }) => {
          const url = new URL(request.url);
          const filter = url.searchParams.get('filter');

          if (filter) {
            mockHandler();
            return HttpResponse.json({
              members: [
                {
                  user: 'users/fakeUserId',
                },
              ],
            } as any);
          }

          return HttpResponse.json({
            errors: [
              {
                message: `Failed to fetch data`,
              },
            ],
          });
        }
      )
    );

    const { result, waitForValueToChange } = renderHook(
      () => useLazyGetTeamMembersQuery({}),
      {
        wrapper,
      }
    );

    const getTeamMembers = result.current[0];

    await act(async () => {
      await getTeamMembers({
        filter: 'user="user/fakeUserId"',
      });
    });

    await waitForValueToChange(() => result.current[1].isLoading);

    const { isLoading } = result.current[1];

    await waitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});

describe.skip('Test useMoveMemberToTeamMutation', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should call move member from team api', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.post(
        getApiEndpoint(
          '/api/team/v1alpha1/teams/fakeTeamId/users/fakeUserId:move'
        ),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    const { result, waitForValueToChange } = renderHook(
      () => useMoveMemberToTeamMutation(),
      {
        wrapper,
      }
    );
    const [moveMemberToTeam] = result.current;

    await act(async () => {
      await moveMemberToTeam({
        fullMemberResource: 'teams/fakeTeamId/users/fakeUserId',
        moveData: {
          parent: 'teams/fakeTeamId',
        },
      });
    });
    await waitForValueToChange(() => result.current[1].isLoading === false);

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});

describe('Test useDeleteMemberFromTeamMutation', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should call delete member from team api', async () => {
    const mockHandler = jest.fn();

    server.use(
      http.delete(
        getApiEndpoint('/api/team/v1alpha1/teams/fakeTeamId/users/fakeUserId'),
        () => HttpResponse.json(mockHandler())
      )
    );

    const { result, waitForValueToChange } = renderHook(
      () => useDeleteMemberFromTeamMutation(),
      {
        wrapper,
      }
    );
    const [deleteMemberFromTeam] = result.current;

    await act(async () => {
      await deleteMemberFromTeam({
        fullMemberResource: 'teams/fakeTeamId/users/fakeUserId',
      });
    });

    await waitForValueToChange(() => result.current[1].isLoading === false);

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
