import { LeadActivityTypes } from 'presentation/redux/actions/leadActivity';
import { IAction } from 'shared/interfaces/common';

const initialState = {
  comments: [],
  nextPageToken: '',
  isCommentCreating: false,
  isFetching: false,
  error: '',
};

export default function getComment(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadActivityTypes.CLEAR_ALL_COMMENT: {
      return {
        ...state,
        comments: [],
      };
    }

    case LeadActivityTypes.GET_COMMENT_AFTER_CREATE:
    case LeadActivityTypes.GET_COMMENT: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case LeadActivityTypes.GET_COMMENT_AFTER_CREATE_FAIL:
    case LeadActivityTypes.GET_COMMENT_FAIL: {
      return {
        ...state,
        error: action.error,
        isFetching: false,
      };
    }

    case LeadActivityTypes.GET_COMMENT_SUCCESS: {
      const { comments, nextPageToken } = action.payload;
      return {
        ...state,
        comments: [...state.comments, ...comments],
        nextPageToken,
        isFetching: false,
      };
    }

    case LeadActivityTypes.GET_COMMENT_AFTER_CREATE_SUCCESS: {
      const { comments, nextPageToken } = action.payload;
      return {
        ...state,
        comments: [...comments],
        nextPageToken,
        isFetching: false,
      };
    }

    case LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS: {
      const newComment = action.payload;
      return {
        ...state,
        comments: [newComment, ...state.comments],
      };
    }

    default:
      return state;
  }
}
