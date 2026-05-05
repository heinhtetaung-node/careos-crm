import HistoryResponse from '@alphafounders/mock-data/json/leadHistory.json';
import { renderHook } from '@testing-library/react-hooks';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import { useGetHistoryBffQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe('Test useGetHistoryBffQuery', () => {
  beforeEach(() => {
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha2/leads/f2725cba-7594-4538-ab95-933b118cbf67:history',
          ServicesName.GFF
        ),
        () => HttpResponse.json(HistoryResponse)
      )
    );
  });

  it('should call the gff history endpoint and return response', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useGetHistoryBffQuery(
          '/v1alpha2/leads/f2725cba-7594-4538-ab95-933b118cbf67:history'
        ),
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
      expect.objectContaining(HistoryResponse.record)
    );
  });
});
