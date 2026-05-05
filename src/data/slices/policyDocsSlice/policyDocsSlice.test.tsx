import { waitFor, renderHook } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { apiSlice } from '../apiSlice';

import { useLazyGetPolicyDocsQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const docs = [
  {
    name: 'orders/2d5f3d2c-5d19-4947-87f5-380aa7c62981/documents/1c03150b-fe2c-46ba-8e74-333d2b99b82a',
    createTime: '2023-01-18T10:00:32.588691Z',
    updateTime: '2023-01-18T10:00:32.588691Z',
    deleteTime: null,
    createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
    document: 'documents/8e352808-a6db-41d2-83fc-9b195b910469',
    type: 'DOCUMENT_TYPE_ENDORSEMENT',
    label: 'endorsement-Screenshot 2022-12-20 at 5.44.53 PM.png',
    item: 'items/6c6158cf-e558-43bb-bb0c-b514cf33ff0b',
  },
  {
    name: 'orders/2d5f3d2c-5d19-4947-87f5-380aa7c62981/documents/1c03150b-fe2c-46ba-8e74-333d2b99b82a',
    createTime: '2023-01-18T10:00:32.588691Z',
    updateTime: '2023-01-18T10:00:32.588691Z',
    deleteTime: null,
    createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a294338',
    document: 'documents/8e352808-a6db-41d2-83fc-9b195b910469',
    type: 'DOCUMENT_TYPE_POLICY',
    label: 'policyCertificate-Screenshot 2022-12-20 at 5.44.53 PM.png',
    item: 'items/6c6158cf-e558-43bb-bb0c-b514cf33ff0b',
  },
];

describe.skip('useLazyGetPolicyDocsQuery', () => {
  it('fetches policy documents uploaded', async () => {
    // TODO: Check the params.set
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/123555/documents`,
        () =>
          HttpResponse.json({
            documents: docs,
          })
      )
    );

    const { result } = renderHook(() => useLazyGetPolicyDocsQuery(), {
      wrapper,
    });
    const [getPolicyDocs] = result.current;

    await getPolicyDocs({
      orderId: '123555',
      policyId: '434',
    });

    const { isLoading, data } = result.current[1];
    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        documents: [
          { ...docs[0] },
          { ...docs[1], createBy: 'undefined undefined' },
        ],
      });
    });
  });

  it('handle api failure', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/123/documents`,
        () => HttpResponse.json({ message: 'text.error' }, { status: 500 }) // TODO: Check the params.set
      )
    );

    const { result } = renderHook(() => useLazyGetPolicyDocsQuery(), {
      wrapper,
    });
    const [getPolicyDocs] = result.current;

    await getPolicyDocs({
      orderId: '123',
      policyId: '434',
    });

    const { isLoading, error, isError } = result.current[1];
    await hookWaitFor(() => {
      expect(isLoading).toBeFalsy();
      expect(isError).toBeTruthy();
    });
    await waitFor(() => {
      expect(error).toEqual({
        status: 500,
        data: { message: 'text.error' },
      });
    });
  });
});
