/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import userSlice from 'data/slices/userSlice';
import { getCommentData } from 'presentation/redux/epics/leadActivity/helper';

interface CommentPayload {
  payload: any;
  orderId: string;
}

interface CommentResponse {
  createBy: string;
  createTime: string;
  deleteTime?: string;
  name: string;
  text: string;
  updateTime: string;
}

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['ORDER_COMMENTS'],
});
let initialCall = 0;

const orderCommentSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    addOrderComment: build.mutation<CommentResponse, CommentPayload>({
      query: ({ payload }) => {
        const { orderId, ...newPayload } = payload;
        initialCall = 1;
        return {
          url: `${basePaths.order}/orders/${orderId}/comments`,
          method: 'POST',
          body: newPayload,
        };
      },
      invalidatesTags: ['ORDER_COMMENTS'],
    }),
    getOrderComments: build.query<any, any>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let { orderId, filter = '', orderBy = '', pageToken = '' } = _arg;
        if (initialCall === 1) {
          pageToken = '';
        }
        initialCall = 0;
        const queryParams = new URLSearchParams({
          pageSize: 5,
          pageToken,
          filter,
          orderBy,
          showDeleted: 'false',
        } as Record<string, any>).toString();
        const comments: any = await fetchWithBQ(
          `${baseUrls.goBff}/v1alpha1/orders/${orderId}/comments?${queryParams}`
        );
        const users = await _queryApi.dispatch(
          userSlice.endpoints.getUsers.initiate('pageSize=1000')
        );
        if (comments.data && users?.data?.users) {
          const usersData = users.data.users.map((user) => ({
            key: user.name,
            value: `${user.firstName} ${user.lastName}`,
          }));
          const res = [
            { selectData: usersData },
            { comments: comments.data.comments },
            { pageToken: comments.data.pageToken },
          ];
          return { data: getCommentData(res) };
        }
        return { error: comments.error as FetchBaseQueryError };
      },
      providesTags: ['ORDER_COMMENTS'],
    }),
  }),
});

export const {
  useAddOrderCommentMutation,
  useGetOrderCommentsQuery,
  useLazyGetOrderCommentsQuery,
} = orderCommentSlice;
