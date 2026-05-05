import { renderHook, act, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import getApiEndpoint from 'utils/endpointHelper';

import { apiSlice } from '../../apiSlice';

import { useCreateOrderMutation } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe('useCreateOrderMutation', () => {
  it('calls gff endpoint correctly', async () => {
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/123:createOrderWithPricing'),
        () =>
          HttpResponse.json({
            success: true,
          })
      )
    );

    const { result } = renderHook(() => useCreateOrderMutation({}), {
      wrapper,
    });
    const [createOrder] = result.current;
    const form = new FormData();
    form.append('document', 'documents/fakeResource');
    form.append('paidAmount', '1234');
    form.append('paidTime', format(new Date(), 'yyyy-MM-dd'));

    await act(async () => {
      await createOrder({
        leadId: 'leads/123',
        form,
      });
    });

    const { isLoading, data, isError } = result.current[1];

    await hookWaitFor(() => {
      expect(isLoading).toBeFalsy();
      expect(isError).toBeFalsy();
    });
    await waitFor(() => {
      expect(data).toEqual({ success: true });
    });
  });

  it('calls new gff endpoint correctly when lending feature flag is enabled', async () => {
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/123:createOrderWithPricing'),
        () =>
          HttpResponse.json({
            success: false,
          })
      )
    );

    const { result } = renderHook(() => useCreateOrderMutation({}), {
      wrapper,
    });
    const [createOrder] = result.current;
    const form = new FormData();
    form.append('document', 'documents/fakeResource');
    form.append('paidAmount', '1234');
    form.append('paidTime', format(new Date(), 'yyyy-MM-dd'));

    await act(async () => {
      await createOrder({
        leadId: 'leads/123',
        form,
      });
    });

    const { isLoading, data, isError } = result.current[1];

    await hookWaitFor(() => {
      expect(isLoading).toBeFalsy();
      expect(isError).toBeFalsy();
    });
    await waitFor(() => {
      expect(data).toEqual({ success: false });
    });
  });
});
