import UserRoles from '@alphafounders/mock-data/json/userRoles.json';
import { renderHook } from '@testing-library/react-hooks';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';
import { cleanup, act, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import {
  useGetAllUserStreamingByLeadSearchQuery,
  useGetAllUsersByStreamingQuery,
  useGetAssignedUsersQuery,
  useGetUserRecoveryLinkQuery,
  useGetUsersQuery,
  useGetUserRolesQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUnDeleteUserMutation,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const users = [
  {
    name: 'name/1',
    firstName: 'first1',
    lastName: 'last1',
    id: 'name/1',
    key: 'name/1',
    title: 'first1 last1',
    value: 'name/1',
  },
  {
    name: 'name/2',
    firstName: 'first2',
    lastName: 'last2',
    id: 'name/2',
    key: 'name/2',
    title: 'first2 last2',
    value: 'name/2',
  },
];

beforeEach(() => {
  cleanup();
  server.use(
    http.get(getApiEndpoint('/api/user/v1alpha1/users'), ({ params }) => {
      const nextPageToken = params.pageToken as string;
      if (nextPageToken) {
        return HttpResponse.json({
          users: users.slice(1),
          nextPageToken: '',
        });
      }
      return HttpResponse.json({
        users: users.slice(0, 1),
        nextPageToken: 'abcd1234',
      });
    })
  );
});

afterEach(cleanup);

test.skip('Test useCreateUserMutation', async () => {
  const mockHandler = jest.fn();

  server.use(
    http.post(getApiEndpoint('/api/user/v1alpha1/users'), async ({ request }) =>
      HttpResponse.json(mockHandler(await request.json()))
    )
  );

  const { result, unmount } = renderHook(() => useCreateUserMutation(), {
    wrapper,
  });

  const [createUser] = result.current;

  await act(async () => {
    await createUser({
      humanId: 'test@testing.com',
      firstName: 'Test',
      lastName: 'Test',
      role: 'roles/sales',
      annotations: {
        lang: 'EN',
        daily_limit: '100',
        score: '3',
        total_limit: '1000',
      },
    });
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy(), 3000);
  await waitFor(() => {
    expect(mockHandler).toHaveBeenNthCalledWith(1, {
      annotations: {
        daily_limit: '100',
        lang: 'EN',
        score: '3',
        total_limit: '1000',
      },
      firstName: 'Test',
      humanId: 'test@testing.com',
      lastName: 'Test',
      role: 'roles/sales',
    });
  });

  unmount();
});

test.skip('Test useUpdateUserMutation', async () => {
  const mockHandler = jest.fn();

  server.use(
    http.patch(
      getApiEndpoint('/api/user/v1alpha1/users/fakeUserId'),
      async ({ request }) =>
        HttpResponse.json(mockHandler(await request.json()))
    )
  );

  const { result, unmount } = renderHook(() => useUpdateUserMutation(), {
    wrapper,
  });

  const [updateUser] = result.current;

  await act(async () => {
    await updateUser({
      userId: 'users/fakeUserId',
      userData: {
        humanId: 'testing@testa.com',
        firstName: 'updatedFirstName',
        lastName: 'udpatedLastName',
        role: 'roles/sales',
        annotations: {
          lang: 'EN',
        },
      },
    });
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy(), 3000);
  await waitFor(() => {
    expect(mockHandler).toHaveBeenNthCalledWith(1, {
      annotations: {
        lang: 'EN',
      },
      firstName: 'updatedFirstName',
      humanId: 'testing@testa.com',
      lastName: 'udpatedLastName',
      role: 'roles/sales',
    });
  });

  unmount();
});

test.skip('Test useDeleteUserMutation', async () => {
  const mockHandler = jest.fn();

  server.use(
    http.delete(
      getApiEndpoint('/api/user/v1alpha1/users/fakeUserId'),
      async ({ request }) =>
        HttpResponse.json(mockHandler(await request.json()))
    )
  );

  const { result, unmount } = renderHook(() => useDeleteUserMutation(), {
    wrapper,
  });

  const [deleteUser] = result.current;

  await act(async () => {
    await deleteUser('users/fakeUserId');
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy(), 3000);
  await waitFor(() => {
    expect(mockHandler).toHaveBeenCalled();
  });

  unmount();
});

test.skip('Test useUnDeleteUserMutation', async () => {
  const mockHandler = jest.fn();

  server.use(
    http.post(
      getApiEndpoint('/api/user/v1alpha1/users/fakeUserId:undelete'),
      async ({ request }) =>
        HttpResponse.json(mockHandler(await request.json()))
    )
  );

  const { result, unmount } = renderHook(() => useUnDeleteUserMutation(), {
    wrapper,
  });

  const [unDeleteUser] = result.current;

  await act(async () => {
    await unDeleteUser('users/fakeUserId');
  });

  const { isLoading } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy(), 3000);
  await waitFor(() => {
    expect(mockHandler).toHaveBeenCalled();
  });

  unmount();
});

test.skip('Test getAllUsersByStreaming', async () => {
  const { result, waitForNextUpdate } = renderHook(
    () => useGetAllUsersByStreamingQuery('filter=role="roles/sales"'),
    { wrapper }
  );

  const initialResponse = result.current;
  expect(initialResponse.data).toBeUndefined();
  expect(initialResponse.isLoading).toBeTruthy();

  await waitForNextUpdate();

  const nextResponse = result.current;

  expect(nextResponse.data).toEqual(
    expect.objectContaining({
      users: [
        {
          name: 'name/1',
          firstName: 'first1',
          lastName: 'last1',
          title: 'first1 last1',
          key: 'name/1',
          value: 'name/1',
          id: 'name/1',
        },
      ],
      nextPageToken: 'abcd1234',
    })
  );
});

test.skip('Test getAllUserStreamingByLeadSearch', async () => {
  server.use(
    http.get(getApiEndpoint('/api/lead-search/v1alpha1/search/users'), () =>
      HttpResponse.json({
        users: users.slice(0, 1),
        total: '1',
      })
    )
  );
  const { result, waitForNextUpdate } = renderHook(
    () =>
      useGetAllUserStreamingByLeadSearchQuery(
        'filter=user.role.keyword in("roles/sales")'
      ),
    { wrapper }
  );

  const initialResponse = result.current;
  expect(initialResponse.data).toBeUndefined();
  expect(initialResponse.isLoading).toBeTruthy();

  await waitForNextUpdate();

  const nextResponse = result.current;

  expect(nextResponse.data).toEqual(
    expect.objectContaining({
      users: [
        {
          name: 'name/1',
          firstName: 'first1',
          lastName: 'last1',
          title: 'first1 last1',
          key: 'name/1',
          value: 'name/1',
          id: 'name/1',
        },
      ],
      total: '1',
    })
  );
});

test.skip('Test getUsers', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useGetUsersQuery(''), {
    wrapper,
  });

  const initialResponse = result.current;
  expect(initialResponse.data).toBeUndefined();
  expect(initialResponse.isLoading).toBeTruthy();

  await waitForNextUpdate();

  const nextResponse = result.current;

  expect(nextResponse.data).toEqual(
    expect.objectContaining({
      users,
      nextPageToken: '',
    })
  );
});

test.skip('Test getUserRecoveryLink', async () => {
  server.use(
    http.post(getApiEndpoint('/api/user/v1alpha1/users/recovery'), () =>
      HttpResponse.json({
        recoveryLink: 'some_recover_link',
        expiresAt: '2023-10-03T05:53:56.138Z',
      })
    )
  );
  const { result, waitForNextUpdate } = renderHook(
    () => useGetUserRecoveryLinkQuery('users'),
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
    expect.objectContaining({
      recoveryLink: 'some_recover_link',
      expiresAt: '2023-10-03T05:53:56.138Z',
    })
  );
});

test.skip('Test getAssignedUsers', async () => {
  server.use(
    http.get(
      getApiEndpoint('/api/gff/v1alpha1/users/assigned'),
      ({ params }) => {
        const nextPageToken = params.pageToken as string;
        return HttpResponse.json({
          assignedUsers: nextPageToken ? users.slice(1) : users.slice(0, 1),
          nextPageToken: nextPageToken ? '' : 'token123',
        });
      }
    )
  );
  const { result, waitForNextUpdate } = renderHook(
    () => useGetAssignedUsersQuery(''),
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
    expect.objectContaining({
      assignedUsers: users,
      nextPageToken: '',
    })
  );
});

test.skip('Test getUserRoles', async () => {
  server.use(
    http.get(getApiEndpoint('/api/user/v1alpha1/roles'), () =>
      HttpResponse.json({
        roles: UserRoles,
        nextPageToken: '',
      })
    )
  );
  const { result, waitForNextUpdate } = renderHook(
    () => useGetUserRolesQuery({ pageSize: 100 }),
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
    expect.objectContaining({
      roles: UserRoles,
      nextPageToken: '',
    })
  );
});
