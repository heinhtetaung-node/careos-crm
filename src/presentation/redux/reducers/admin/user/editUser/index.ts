import { UserActionTypes } from 'presentation/redux/actions/admin/user';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

interface EditUserReducer {
  baseProcess: IState<any>;
  currentTeamMemberName: string;
  currentProduct: string;
  currentTeam: string;
}

const initialState: EditUserReducer = {
  baseProcess: ReducerHelper.baseReducer(),
  currentTeamMemberName: '',
  currentProduct: '',
  currentTeam: '',
};

export default function (
  state = initialState,
  action: IAction<any>
): EditUserReducer {
  switch (action.type) {
    case UserActionTypes.DELETE_USER: {
      return {
        ...state,
        baseProcess: ReducerHelper.baseProcessRequest(
          state.baseProcess,
          action
        ),
      };
    }
    case UserActionTypes.DELETE_USER_SUCCESS: {
      return {
        ...state,
        baseProcess: ReducerHelper.baseProcessSuccess(
          state.baseProcess,
          action
        ),
      };
    }
    case UserActionTypes.DELETE_USER_FAILED: {
      return {
        ...state,
        baseProcess: ReducerHelper.baseProcessFailed(state.baseProcess, action),
      };
    }
    case UserActionTypes.UNDELETE_USER:
    case UserActionTypes.UNDELETE_USER_SUCCESS:
    case UserActionTypes.EDIT_USER_SUCCESS: {
      return {
        ...state,
        baseProcess: ReducerHelper.baseProcessSuccess(
          state.baseProcess,
          action
        ),
      };
    }
    case UserActionTypes.UNDELETE_USER_FAILED: {
      return {
        ...state,
        baseProcess: ReducerHelper.baseProcessFailed(state.baseProcess, action),
      };
    }
    case UserActionTypes.GET_TEAM_BY_USER_SUCCESS: {
      return {
        ...state,
        currentTeamMemberName: action.payload?.members[0]?.name,
      };
    }
    case UserActionTypes.GET_TEAM_INFO_SUCCESS: {
      return {
        ...state,
        currentProduct: action.payload?.productType,
        currentTeam: action.payload?.name,
      };
    }
    case UserActionTypes.CLEAR_PRODUCT: {
      return {
        ...state,
        currentProduct: '',
        currentTeam: '',
      };
    }
    default:
      return state;
  }
}
