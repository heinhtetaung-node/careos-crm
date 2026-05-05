import { IAction, IState } from '../../../../../shared/interfaces/common';
import { RoleSelectorActionTypes } from '../../../actions/typeSelector/role';
import ReducerHelper from '../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case RoleSelectorActionTypes.GET_ROLE_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case RoleSelectorActionTypes.GET_ROLE_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case RoleSelectorActionTypes.GET_ROLE_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
