import FollowUpResponse from '@alphafounders/mock-data/json/followupSearch.json';
import FollowUpSearchFormat from '@alphafounders/mock-data/json/followupSearchFormat.json';
import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import { useLazyGenericSearchQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test.skip('Testing getLeadById', async () => {
  server.use(
    http.get(getApiEndpoint('api/lead-search/v1alpha1/search/followups'), () =>
      HttpResponse.json(FollowUpResponse)
    )
  );
  const { result } = renderHook(() => useLazyGenericSearchQuery(), {
    wrapper,
  });
  const [genericSearch] = result.current;

  await act(async () => {
    await genericSearch({
      queryParams: {
        currentPage: 1,
        pageSize: 15,
        pageToken: '',
        orderBy: '',
        type: 'followups',
      },
      tableType: 'allCarePay',
    } as any);
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(FollowUpSearchFormat);
  });
});
