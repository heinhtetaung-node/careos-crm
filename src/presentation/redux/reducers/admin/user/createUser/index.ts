import { UserActionTypes } from 'presentation/redux/actions/admin/user';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<any> = ReducerHelper.baseReducer();

export default function (
  state = initialState,
  action: IAction<any>
): IState<any> {
  switch (action.type) {
    case UserActionTypes.CREATE_USER: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case UserActionTypes.CREATE_USER_SUCCESS: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case UserActionTypes.CREATE_USER_FAILED: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case UserActionTypes.ADD_USER_TO_TEAM: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case UserActionTypes.ADD_USER_TO_TEAM_SUCCESS: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case UserActionTypes.ADD_USER_TO_TEAM_FAILED: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    default:
      return state;
  }
}
