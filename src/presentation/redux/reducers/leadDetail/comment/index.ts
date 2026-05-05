import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadActionTypes } from '../../../actions/leadDetail/comment';

const initialState: IState<any> = {
  data: {
    loading: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function commentReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadActionTypes.PUSH_COMMENT: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadActionTypes.PUSH_COMMENT_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          comments: action.payload,
        },
      };
    }
    case LeadActionTypes.PUSH_COMMENT_FAIL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: false,
          error: action.payload,
        },
      };
    }
    default:
      return state;
  }
}
