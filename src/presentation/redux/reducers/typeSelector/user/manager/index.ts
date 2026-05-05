import { IAction, IState } from '../../../../../../shared/interfaces/common';
import { UserSelectorActionTypes } from '../../../../actions/typeSelector/user';
import ReducerHelper from '../../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case UserSelectorActionTypes.GET_MANAGER_USER_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case UserSelectorActionTypes.GET_MANAGER_USER_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case UserSelectorActionTypes.GET_MANAGER_USER_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
