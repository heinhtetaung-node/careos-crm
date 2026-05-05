import { waitFor, renderHook, act } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import { MockUsersData } from 'mock-data/UserData.mock';

import { apiSlice } from '../apiSlice';

import {
  useAddOrderCommentMutation,
  useLazyGetOrderCommentsQuery,
} from './index';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe('Order Comment Slice', () => {
  it('should call order comments api to post comment', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/test/123/comments`,
        () => HttpResponse.json(mockHandler())
      )
    );
    const { result } = renderHook(() => useAddOrderCommentMutation({}), {
      wrapper,
    });
    const [addComment] = result.current;

    await act(async () => {
      await addComment({
        payload: {
          text: 'test',
          orderId: 'test/123',
        },
        orderId: 'test/123',
      });
    });

    const { isLoading } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
  });
  it('should call order comments and user api to fetch comments', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/test/123/comments`,
        () =>
          HttpResponse.json({
            data: {
              comments: [
                {
                  name: 'orders/c33a31af-d074-4a10-9997-82f9f2e1287b/comments/52c31fd4-af85-4bf1-8e46-3641213dfa07',
                  createTime: '2022-12-29T04:35:34.529131Z',
                  updateTime: '2022-12-29T04:35:34.529131Z',
                  deleteTime: null,
                  createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                  text: 'test',
                  item: '',
                },
              ],
            },
          })
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      )
    );
    const { result } = renderHook(() => useLazyGetOrderCommentsQuery(), {
      wrapper,
    });
    const [fetchComments] = result.current;

    await act(async () => {
      await fetchComments({ orderId: 'test/123' });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(expect.objectContaining({}));
    });
  });
});
