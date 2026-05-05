import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';

import {
  useGetLeadSourceQuery,
  useLazyGetLeadSourceQuery,
  useLazyGetSourcesLeadServiceQuery,
  useLazyGetSourcesQuery,
} from './sourceSlices';

import { apiSlice } from '../apiSlice';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('useLazyGetSourcesQuery', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/view/v1alpha1/views/sources/sources`,
      () =>
        HttpResponse.json({
          sourcesWithScore: [
            {
              name: 'sources/b2f2dae4-ac39-44ee-9993-1b0f710bb97c',
              createTime: '2022-08-15T02:23:41.019600Z',
              updateTime: '2022-08-15T02:23:41.019600Z',
              deleteTime: null,
              createBy: 'users/7f984c4d-88dd-40ed-9755-8a5e15acdb73',
              updateBy: '',
              product: 'products/car-insurance',
              online: false,
              hidden: false,
              source: 'car widget',
              medium: '',
              campaign: '',
              createByFirstName: 'Arina',
              createByLastName: 'Madau',
              createByFullName: 'Arina Madau',
              updateByFirstName: '',
              updateByLastName: '',
              updateByFullName: '',
              leadCount: 13,
              score: 1,
            },
          ],
          nextPageToken: '',
        })
    )
  );
  const { result } = renderHook(() => useLazyGetSourcesQuery({}), {
    wrapper,
  });
  const [getSources] = result.current;

  await act(async () => {
    await getSources();
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(
      expect.objectContaining([
        {
          name: 'sources/b2f2dae4-ac39-44ee-9993-1b0f710bb97c',
          createTime: '2022-08-15T02:23:41.019600Z',
          updateTime: '2022-08-15T02:23:41.019600Z',
          deleteTime: null,
          createBy: 'users/7f984c4d-88dd-40ed-9755-8a5e15acdb73',
          updateBy: '',
          product: 'products/car-insurance',
          online: false,
          hidden: false,
          source: 'car widget',
          medium: '',
          campaign: '',
          createByFirstName: 'Arina',
          createByLastName: 'Madau',
          createByFullName: 'Arina Madau',
          updateByFirstName: '',
          updateByLastName: '',
          updateByFullName: '',
          leadCount: 13,
          score: 1,
        },
      ])
    );
  });
});

test('useLazyGetSourcesLeadServiceQuery', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/sources`,
      () =>
        HttpResponse.json({
          sources: [
            {
              name: 'sources/03ebb3ec-f1bf-4e28-a2a5-90d40c52f1ee',
              createTime: '2022-07-26T11:54:53.892069Z',
              updateTime: '2022-07-26T11:54:53.892069Z',
              deleteTime: null,
              createBy: '',
              updateBy: '',
              product: 'products/car-insurance',
              online: false,
              hidden: false,
              source: 'tiktok',
              medium: 'motion',
              campaign:
                'RC-Motor_Tiktok_BroadAudience_Conversion_Alwayson_20220726',
              content: '',
              term: '',
            },
            {
              name: 'sources/b58b00d0-9a01-4be8-b46b-4aee7932d042',
              createTime: '2022-07-23T08:55:07.069463Z',
              updateTime: '2022-07-23T08:55:07.069463Z',
              deleteTime: null,
              createBy: '',
              updateBy: '',
              product: 'products/car-insurance',
              online: false,
              hidden: false,
              source: 'rabbit.co.th - model-nissan-march',
              medium: '',
              campaign: '',
              content: '',
              term: '',
            },
          ],
          nextPageToken: 'fake-next-page-token',
        }),
      { once: true }
    ),
    http.get(`${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/sources`, () =>
      HttpResponse.json({
        sources: [
          {
            name: 'sources/a641d882-8c97-4b87-ae62-c04354b7efdd',
            createTime: '2022-08-09T11:03:12.582587Z',
            updateTime: '2022-08-09T11:03:12.582587Z',
            deleteTime: null,
            createBy: '',
            updateBy: '',
            product: 'products/car-insurance',
            online: false,
            hidden: false,
            source: 'tiktok',
            medium: 'instant',
            campaign:
              'RC-Motor_Tiktok_BroadAudience_Conversion_Alwayson_20220726',
            content: '',
            term: '',
          },
          {
            name: 'sources/f431f640-09ca-40c6-9145-91335a032c83',
            createTime: '2022-08-03T07:35:10.801463Z',
            updateTime: '2022-08-03T07:35:10.801463Z',
            deleteTime: null,
            createBy: '',
            updateBy: '',
            product: 'products/car-insurance',
            online: false,
            hidden: false,
            source: 'rabbit.co.th - usp-discount',
            medium: '',
            campaign: '',
            content: '',
            term: '',
          },
        ],
        nextPageToken: '',
      })
    )
  );
  const { result } = renderHook(() => useLazyGetSourcesLeadServiceQuery({}), {
    wrapper,
  });
  const [getSourcesLeadService] = result.current;

  await act(async () => {
    await getSourcesLeadService({
      filter: "online=true product in ('products/car-insurance')",
      pageSize: 100,
    });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual([
      {
        name: 'sources/03ebb3ec-f1bf-4e28-a2a5-90d40c52f1ee',
        createTime: '2022-07-26T11:54:53.892069Z',
        updateTime: '2022-07-26T11:54:53.892069Z',
        deleteTime: null,
        createBy: '',
        updateBy: '',
        product: 'products/car-insurance',
        online: false,
        hidden: false,
        source: 'tiktok',
        medium: 'motion',
        campaign: 'RC-Motor_Tiktok_BroadAudience_Conversion_Alwayson_20220726',
        content: '',
        term: '',
      },
      {
        name: 'sources/b58b00d0-9a01-4be8-b46b-4aee7932d042',
        createTime: '2022-07-23T08:55:07.069463Z',
        updateTime: '2022-07-23T08:55:07.069463Z',
        deleteTime: null,
        createBy: '',
        updateBy: '',
        product: 'products/car-insurance',
        online: false,
        hidden: false,
        source: 'rabbit.co.th - model-nissan-march',
        medium: '',
        campaign: '',
        content: '',
        term: '',
      },
      {
        name: 'sources/a641d882-8c97-4b87-ae62-c04354b7efdd',
        createTime: '2022-08-09T11:03:12.582587Z',
        updateTime: '2022-08-09T11:03:12.582587Z',
        deleteTime: null,
        createBy: '',
        updateBy: '',
        product: 'products/car-insurance',
        online: false,
        hidden: false,
        source: 'tiktok',
        medium: 'instant',
        campaign: 'RC-Motor_Tiktok_BroadAudience_Conversion_Alwayson_20220726',
        content: '',
        term: '',
      },
      {
        name: 'sources/f431f640-09ca-40c6-9145-91335a032c83',
        createTime: '2022-08-03T07:35:10.801463Z',
        updateTime: '2022-08-03T07:35:10.801463Z',
        deleteTime: null,
        createBy: '',
        updateBy: '',
        product: 'products/car-insurance',
        online: false,
        hidden: false,
        source: 'rabbit.co.th - usp-discount',
        medium: '',
        campaign: '',
        content: '',
        term: '',
      },
    ]);
  });
});

test('useGetLeadSourceQuery', async () => {
  const mockSource = {
    name: 'sources/test-source-id',
    createTime: '2022-08-15T02:23:41.019600Z',
    updateTime: '2022-08-15T02:23:41.019600Z',
    createBy: 'users/test-user',
    updateBy: 'users/test-user',
    product: 'products/car-insurance',
    online: true,
    source: 'facebook',
    medium: 'social',
    campaign: 'summer-campaign',
    createByFirstName: 'John',
    createByLastName: 'Doe',
    createByFullName: 'John Doe',
    updateByFirstName: 'John',
    updateByLastName: 'Doe',
    updateByFullName: 'John Doe',
  };

  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/test-source-name`,
      () => HttpResponse.json(mockSource)
    )
  );

  const { result } = renderHook(
    () => useGetLeadSourceQuery({ sourceName: 'test-source-name' }),
    { wrapper }
  );

  await hookWaitFor(() => expect(result.current.isLoading).toBeFalsy());
  await waitFor(() => {
    expect(result.current.data).toEqual(mockSource);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
});

test('useLazyGetLeadSourceQuery', async () => {
  const mockSource = {
    name: 'sources/lazy-test-source-id',
    createTime: '2022-08-15T02:23:41.019600Z',
    updateTime: '2022-08-15T02:23:41.019600Z',
    createBy: 'users/test-user',
    updateBy: 'users/test-user',
    product: 'products/car-insurance',
    online: false,
    source: 'google',
    medium: 'search',
    campaign: 'brand-campaign',
    createByFirstName: 'Jane',
    createByLastName: 'Smith',
    createByFullName: 'Jane Smith',
    updateByFirstName: 'Jane',
    updateByLastName: 'Smith',
    updateByFullName: 'Jane Smith',
  };

  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/lazy-test-source-name`,
      () => HttpResponse.json(mockSource)
    )
  );

  const { result } = renderHook(() => useLazyGetLeadSourceQuery(), {
    wrapper,
  });

  const [getLeadSource] = result.current;

  await act(async () => {
    await getLeadSource({ sourceName: 'lazy-test-source-name' });
  });

  const { isLoading, data, isSuccess, error } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(mockSource);
    expect(isSuccess).toBe(true);
    expect(error).toBeUndefined();
  });
});

test('useGetLeadSourceQuery - error handling', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/non-existent-source`,
      () => HttpResponse.json({ error: 'Source not found' }, { status: 404 })
    )
  );

  const { result } = renderHook(
    () => useGetLeadSourceQuery({ sourceName: 'non-existent-source' }),
    { wrapper }
  );

  await hookWaitFor(() => expect(result.current.isLoading).toBeFalsy());
  await waitFor(() => {
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });
});
