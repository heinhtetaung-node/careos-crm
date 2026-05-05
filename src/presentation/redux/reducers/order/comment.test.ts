import { OrderCommentTypes } from 'presentation/redux/actions/order/comment';

import orderActivityReducer from './comment';

const initialState = {
  comments: [],
  nextPageToken: '',
  isCommentCreating: false,
  isFetching: false,
  error: '',
};

describe('Order Activity Comment Reducer', () => {
  test('handle clearing of comments', () => {
    const action = {
      type: OrderCommentTypes.CLEAR_ALL_COMMENT,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      comments: [],
    });
  });

  test('handle loading while fetching comments', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      isFetching: true,
    });
  });

  test('handle comments fetching failure', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT_FAIL,
      error: true,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      error: true,
      isFetching: false,
    });
  });

  test('fetch comments', () => {
    const fakeListActivities = [
      {
        name: 'Pailin left a comment',
        createTime: '2021-07-08T03:27:20.232408Z',
        text: 'some documents still missing, but urgent case',
      },
      {
        name: 'Pailin uploaded documents',
        createTime: '2021-07-08T03:27:20.232408Z',
        text: 'ID Card',
      },
    ];
    const action = {
      type: OrderCommentTypes.GET_COMMENT_SUCCESS,
      payload: {
        comments: fakeListActivities,
        nextPageToken: 'asaska1-1021-21-0212',
      },
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      error: false,
      comments: fakeListActivities,
      nextPageToken: 'asaska1-1021-21-0212',
    });
  });

  test('add new comment', () => {
    const action = {
      type: OrderCommentTypes.CREATE_ORDER_COMMENT,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      isFetching: true,
      isCommentCreating: true,
    });
  });

  test('add new comment success', () => {
    const newComment = {
      name: 'Pailin',
      createTime: '2021-07-08T03:27:20.232408Z',
      text: 'ID Card',
    };
    const action = {
      type: OrderCommentTypes.CREATE_ORDER_COMMENT_SUCCESS,
      payload: newComment,
    };

    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      isFetching: false,
      isCommentCreating: false,
    });
  });

  test('add new comment fails', () => {
    const action = {
      type: OrderCommentTypes.CREATE_ORDER_COMMENT_FAIL,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      error: true,
      isFetching: false,
      isCommentCreating: false,
    });
  });

  test('fetch comments after add a new comment', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      isFetching: true,
    });
  });

  test('fetch comments after add a new comment success', () => {
    const comments = [
      {
        name: 'Pailin',
        createTime: '2021-07-08T03:27:20.232408Z',
        text: 'ID Card',
      },
    ];

    const action = {
      type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE_SUCCESS,
      payload: {
        comments,
        nextPageToken: 'asaska1-1021-21-0212',
      },
    };

    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      isFetching: false,
      comments: [...comments, ...initialState.comments],
      nextPageToken: 'asaska1-1021-21-0212',
    });
  });

  test('fetch comments after add a new comment fails', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE_FAIL,
      error: true,
    };
    expect(orderActivityReducer(initialState, action)).toEqual({
      ...initialState,
      error: true,
      isFetching: false,
    });
  });
});
