import { OrderCommentTypes } from 'presentation/redux/actions/order/comment';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction } from 'shared/interfaces/common';

const initialState: any = {
  ...ReducerHelper.baseReducer(),
  comments: [],
  nextPageToken: '',
  isCommentCreating: false,
  isFetching: false,
  error: '',
};

export default function comment(state = initialState, action: IAction<any>) {
  switch (action.type) {
    case OrderCommentTypes.CREATE_ORDER_COMMENT:
      return {
        ...state,
        isFetching: true,
        isCommentCreating: true,
      };
    case OrderCommentTypes.CREATE_ORDER_COMMENT_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        isCommentCreating: false,
      };
    }
    case OrderCommentTypes.CREATE_ORDER_COMMENT_FAIL:
      return {
        ...state,
        error: true,
        isFetching: false,
        isCommentCreating: false,
      };
    case OrderCommentTypes.CLEAR_ALL_COMMENT: {
      return {
        ...state,
        comments: [],
      };
    }

    case OrderCommentTypes.GET_COMMENT:
    case OrderCommentTypes.GET_COMMENT_AFTER_CREATE: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case OrderCommentTypes.GET_COMMENT_FAIL:
    case OrderCommentTypes.GET_COMMENT_AFTER_CREATE_FAIL: {
      return {
        ...state,
        error: true,
        isFetching: false,
      };
    }

    case OrderCommentTypes.GET_COMMENT_SUCCESS: {
      const { comments, nextPageToken } = action.payload;
      return {
        ...state,
        comments: [...state.comments, ...comments],
        nextPageToken,
        error: false,
        isFetching: false,
      };
    }

    case OrderCommentTypes.GET_COMMENT_AFTER_CREATE_SUCCESS: {
      const { comments, nextPageToken } = action.payload;
      return {
        ...state,
        comments: [...comments],
        nextPageToken,
        isFetching: false,
      };
    }

    default:
      return state;
  }
}
