import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
  useAddOrderCommentMutation,
  useLazyGetOrderCommentsQuery,
} from 'data/slices/orderCommentSlice';
import { getCommentAfterCreateSuccess } from 'presentation/redux/actions/order/comment';

interface CommentPayload {
  createBy?: string;
  text: string;
  orderId?: string;
}

export default function useOrderComments() {
  const dispatch = useDispatch();
  const [addComment] = useAddOrderCommentMutation();
  const [fetchComments, { data, isSuccess, isError, isLoading }] =
    useLazyGetOrderCommentsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getCommentAfterCreateSuccess(data));
    }
  }, [data, isSuccess, dispatch]);

  const addAndGetComment = async (
    payload: CommentPayload | undefined,
    orderId = ''
  ) => {
    // post new comment
    await addComment({ payload, orderId });
  };

  return [
    addAndGetComment,
    fetchComments,
    {
      data,
      isLoading,
      isError,
      isSuccess,
    },
  ] as const;
}
