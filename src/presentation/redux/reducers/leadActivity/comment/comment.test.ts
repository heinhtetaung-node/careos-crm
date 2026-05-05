import { LeadActivityTypes } from 'presentation/redux/actions/leadActivity';

import getComment from '.';

const initialState = {
  comments: [],
  nextPageToken: '',
  isCommentCreating: false,
  isFetching: false,
  error: '',
};

test('check getCommentReducer run with LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS', () => {
  const newComment = {
    name: 'leads/xyz/comments/pqr',
  };
  const action = {
    type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS,
    payload: newComment,
  };

  expect(getComment(initialState, action)).toEqual({
    ...initialState,
    comments: [newComment, ...initialState.comments],
  });
});
