import { waitFor, renderHook, act } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import {
  useLazyGetActivitiesQuery,
  useLazyGetResourceHistoryQuery,
} from './api';

import { apiSlice } from '../../apiSlice';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('Testing add more activity', async () => {
  const fakeActivityResponse = {
    activities: [
      {
        remark: 'test',
      },
      {
        comment: {
          name: 'leads/3f91972d-1f45-487e-bdc4-a9c2606f9af4/comments/79730124-7ace-4c75-88dd-0134911cd732',
          createTime: '2022-12-20T13:33:35.252683Z',
          updateTime: '2022-12-20T13:33:35.252683Z',
          deleteTime: null,
          createBy: 'users/00000000-0000-0000-0000-000000000000',
          text: 'test',
        },
      },
      {
        script: {
          name: 'leads/3f91972d-1f45-487e-bdc4-a9c2606f9af4/scripts/afd4700d-11ee-47fd-a565-7c34378570d9',
          createTime: '2022-12-20T13:32:55.613840Z',
          updateTime: '2022-12-20T13:32:55.613840Z',
          deleteTime: null,
          createBy: 'users/00000000-0000-0000-0000-000000000000',
          text: 'test',
        },
      },
    ],
    nextPageToken: '',
  };

  const fakeActivityResponseTransformed = {
    activities: [
      {
        createBy: '',
        type: 'remark',
        remark: 'test',
      },
      {
        comment: {
          name: 'leads/3f91972d-1f45-487e-bdc4-a9c2606f9af4/comments/79730124-7ace-4c75-88dd-0134911cd732',
          createTime: '2022-12-20T13:33:35.252683Z',
          updateTime: '2022-12-20T13:33:35.252683Z',
          deleteTime: null,
          createBy: 'users/00000000-0000-0000-0000-000000000000',
          text: 'test',
        },
        createBy: 'Testing Testing',
        type: 'comment',
      },
      {
        script: {
          name: 'leads/3f91972d-1f45-487e-bdc4-a9c2606f9af4/scripts/afd4700d-11ee-47fd-a565-7c34378570d9',
          createTime: '2022-12-20T13:32:55.613840Z',
          updateTime: '2022-12-20T13:32:55.613840Z',
          deleteTime: null,
          createBy: 'users/00000000-0000-0000-0000-000000000000',
          text: 'test',
        },
        createBy: 'Testing Testing',
        type: 'script',
      },
    ],
    nextPageToken: '',
  };

  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/fakeLeadId/activities`,
      () => HttpResponse.json(fakeActivityResponse)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/00000000-0000-0000-0000-000000000000`,
      () => HttpResponse.json({ firstName: 'Testing', lastName: 'Testing' })
    )
  );

  const { result } = renderHook(() => useLazyGetActivitiesQuery({}), {
    wrapper,
  });

  const [fetchActivity] = result.current;
  await act(async () => {
    await fetchActivity({
      leadId: 'leads/fakeLeadId',
      allActivityParams: { pageToken: '' },
    });
  });

  const { isLoading, isError, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(isError).toBeFalsy();
    expect(data).toEqual(fakeActivityResponseTransformed);
  });
});

test('getResourceHistory', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/v1alpha1/leadID/resourceHistory`,
      () =>
        HttpResponse.json({
          baseRecords: {},
          patches: [
            {
              user: {},
              resource: 'abc',
              version: 'v1alpha1',
              diffs: {
                '@type': '',
                value: [],
              },
            },
          ],
          nextPageToken: '',
        })
    )
  );
  const { result } = renderHook(() => useLazyGetResourceHistoryQuery(), {
    wrapper,
  });
  await act(() =>
    result.current?.[0]?.({ queryParams: { leadId: 'leadID' } as never })
  );
});
