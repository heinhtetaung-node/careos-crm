import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';
import { render, screen } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { useGetCovernoteMutation } from 'data/slices/orderPolicySlice';

import CovernoteDownload from './CovernoteDownload';

const storeRef = setupApiStore(apiSlice);

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const policyId =
  'orders/dc50812f-cfd9-4651-838f-2da1aceb5a26/items/3a77a97d-3d6f-46e5-88fd-9a0c33b710e6';

describe('Test <CovernoteDownload/>', () => {
  it('Should render Covernote button', () => {
    render(<CovernoteDownload policyId={policyId} />, { wrapper });
    expect(screen.getByText('order.policies.covernote')).toBeInTheDocument();
  });

  it('Should download Covernote', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/${policyId}:generateCovernote`,
        () =>
          HttpResponse.json({
            documentName: 'documents/6d9d4e30-c051-4649-840e-0627c31ae8d5',
          })
      )
    );

    render(<CovernoteDownload policyId={policyId} />, { wrapper });
    userEvent.click(screen.getByRole('button'));

    const { result } = renderHook(() => useGetCovernoteMutation({}), {
      wrapper,
    });
    const [getCovernote] = result.current;
    await act(async () => {
      await getCovernote({
        policyId,
        payload: {
          lang: 'EN',
        },
      });
    });

    const { isLoading, data } = result.current[1];
    await hookWaitFor(() => expect(isLoading).toBeFalsy());

    expect(data).toEqual({
      documentName: 'documents/6d9d4e30-c051-4649-840e-0627c31ae8d5',
    });
  });
  it('Handle error if download fails', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/${policyId}:generateCovernote`,
        () => HttpResponse.json({ message: 'text.error' }, { status: 500 })
      )
    );

    render(<CovernoteDownload policyId={policyId} />, { wrapper });
    userEvent.click(screen.getByRole('button'));

    const { result } = renderHook(() => useGetCovernoteMutation({}), {
      wrapper,
    });
    const [getCovernote] = result.current;
    await act(async () => {
      await getCovernote({
        policyId,
        payload: {
          lang: 'EN',
        },
      });
    });

    const { isLoading, isError } = result.current[1];
    await hookWaitFor(() => expect(isLoading).toBeFalsy());

    expect(isError).toEqual(true);
  });
});
