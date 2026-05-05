import { waitFor, renderHook } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { apiSlice } from '../apiSlice';

import { useUploadDocumentMutation } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe.skip('useUploadDocumentMutation', () => {
  it('calls document service then uploads the file to the uploadUrl and return the document resource', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/document/v1alpha1/documents`,
        () =>
          HttpResponse.json({
            document: {
              name: 'documents/f68ece29-4f0e-4b4b-9158-0403921a0b60',
              object: '4136554025/File Example',
              contentType: 'text/csv',
              displayName: 'File Example',
              createTime: '2021-07-27T04:30:37.644965Z',
              updateTime: '2021-07-27T04:30:37.644965Z',
            },
            uploadUrl: `${process.env.VITE_API_ENDPOINT}/fakeGClink`,
          })
      ),
      http.put(`${process.env.VITE_API_ENDPOINT}/fakeGClink`, () =>
        HttpResponse.json({})
      )
    );

    const { result } = renderHook(() => useUploadDocumentMutation({}), {
      wrapper,
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        documentResource: 'documents/f68ece29-4f0e-4b4b-9158-0403921a0b60',
        message: 'Success',
      });
    });
  });

  it('calls document service and returns error message if api fails', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/document/v1alpha1/documents`,
        () => HttpResponse.json({ message: 'text.error' })
      )
    );

    const { result } = renderHook(() => useUploadDocumentMutation({}), {
      wrapper,
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
