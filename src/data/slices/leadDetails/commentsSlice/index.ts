import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { baseUrls, apiSlice } from 'data/slices/apiSlice';
import userSlice from 'data/slices/userSlice';
import generateQueryParams from 'shared/helper/QueryParams';
import { buildUrl } from 'utils/url';

import {
  CommentResponsePayload,
  CommentRequestPayload,
  AddCommentRequestPayload,
  CommentProps,
} from './interface';

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['POST'] });

const commentsSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query<CommentResponsePayload, CommentRequestPayload>({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        const { leadId, commentsParam } = _args;

        const comments: any = await fetchWithBQ(
          buildUrl(baseUrls.salesFlow, {
            path: `/api/lead/v1alpha2/${leadId}/comments?${generateQueryParams(
              commentsParam
            )}`,
          })
        );

        if (comments?.data) {
          if (comments.data.comments.length) {
            try {
              const commentWithName = comments.data.comments.map(
                async (comment: CommentProps) => {
                  if (comment.createBy !== '') {
                    try {
                      const userName = await _queryApi
                        .dispatch(
                          userSlice.endpoints.getUserByUserId.initiate(
                            comment.createBy
                          )
                        )
                        .unwrap();
                      return {
                        ...comment,
                        name: `${userName.firstName} ${userName.lastName}`,
                      };
                    } catch (e) {
                      const err = e as Error;
                      newrelic?.noticeError?.(err);
                      return {
                        ...comment,
                        name: '-',
                      };
                    }
                  }

                  return {
                    ...comment,
                    name: '',
                  };
                }
              );

              const commentsWithUserName: any = await Promise.all(
                commentWithName
              ).then((res: any) => res);

              return {
                data: {
                  comments: [...commentsWithUserName],
                  nextPageToken: comments.data.nextPageToken,
                },
              };
            } catch (error) {
              return { error: error as FetchBaseQueryError };
            }
          }
          return { data: comments.data };
        }
        return { error: comments.error as FetchBaseQueryError };
      },
    }),
    addComment: build.mutation<CommentProps, AddCommentRequestPayload>({
      query: ({ text, leadId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/lead/v1alpha2/${leadId}/comments`,
        }),
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: ['POST'],
    }),
    getComment: build.query<CommentProps, string>({
      query: (commentId) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/lead/v1alpha2/${commentId}`,
        }),
      }),
    }),
  }),
});

export const { useLazyGetCommentsQuery, useAddCommentMutation } = commentsSlice;
export default commentsSlice;
