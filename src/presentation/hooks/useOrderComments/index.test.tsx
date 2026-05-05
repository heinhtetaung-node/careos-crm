import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import { apiSlice } from 'data/slices/apiSlice';
import { MockUsersData } from 'mock-data/UserData.mock';

import useOrderComments from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('Order Comment Slice', async () => {
  const mockHandler = jest.fn();
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/test/123/comments`,
      () => HttpResponse.json(mockHandler())
    ),
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

  const { result } = renderHook(() => useOrderComments(), {
    wrapper,
  });
  const [addAndGetComment] = result.current;

  await act(async () => {
    await addAndGetComment(
      {
        text: 'test',
        orderId: 'test/123',
      },
      'test/123'
    );
  });

  const { isLoading } = result.current[1] as any;

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
});
