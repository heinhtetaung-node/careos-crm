import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../apiSlice';

import { useLazyGetAddressDataQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('Test address service API', async () => {
  server.use(
    http.get(getEndpoint('/api/address/v1alpha1/provinces'), () =>
      HttpResponse.json({
        data: {},
      })
    )
  );
  const { result } = renderHook(() => useLazyGetAddressDataQuery(), {
    wrapper,
  });
  const [getAddressData] = result.current;

  await act(async () => {
    await getAddressData({ pathParam: 'provinces' });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(expect.objectContaining({}));
  });
});
