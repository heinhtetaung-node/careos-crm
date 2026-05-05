import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { MockInsurers } from 'mock-data/Insurers.mock';

import { apiSlice } from '../apiSlice';

import { useGetAllInsurersByStreamingQuery } from '.';

const storeRef = setupApiStore(apiSlice);

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const spyFetch = jest.spyOn(window, 'fetch');

beforeEach(() => {
  storeRef.store.dispatch(apiSlice.util.resetApiState());
});

test.skip('Test getAllInsurersByStreamingQuery', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
      ({ params }) => {
        const nextPageToken = params.pageToken as string;
        if (!nextPageToken) {
          return HttpResponse.json({
            insurers: MockInsurers.insurers.slice(0, 3),
            nextPageToken: 'abcd1234',
          });
        }

        return HttpResponse.json({
          insurers: MockInsurers.insurers.slice(3),
          nextPageToken: '',
        });
      }
    )
  );

  const { result } = renderHook(
    () => useGetAllInsurersByStreamingQuery({ pageSize: 100 }),
    { wrapper }
  );

  const initialResponse = result.current;
  expect(initialResponse.data).toBeUndefined();
  expect(initialResponse.isLoading).toBeTruthy();

  await waitFor(() => {
    const nextResponse = result.current;
    expect(nextResponse.data).toEqual({
      insurers: MockInsurers.insurers.slice(0, 3),
      nextPageToken: 'abcd1234',
    });
  });

  await waitFor(() => {
    const nextResponse = result.current;
    expect(nextResponse.data).toEqual(MockInsurers);
  });
});

test.skip('Test getAllInsurersByStreamingQuery with no nextPageToken', async () => {
  server.use(
    http.get(`${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`, () =>
      HttpResponse.json(MockInsurers)
    )
  );

  const { result } = renderHook(() => useGetAllInsurersByStreamingQuery({}), {
    wrapper,
  });

  expect(spyFetch).toHaveBeenCalledWith(
    expect.objectContaining({
      url: 'http://localhost:4432/api/car/v1alpha1/insurers?pageSize=100',
    })
  );

  const initialResponse = result.current;
  expect(initialResponse.data).toBeUndefined();
  expect(initialResponse.isLoading).toBeTruthy();

  await waitFor(() => {
    const nextResponse = result.current;
    expect(nextResponse.data?.nextPageToken).toBe('');
  });
});
