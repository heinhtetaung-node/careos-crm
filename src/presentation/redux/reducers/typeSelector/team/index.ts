import { IAction, IState } from '../../../../../shared/interfaces/common';
import {
  TeamSelectorActionTypes,
  TeamRoleSelectorActionTypes,
} from '../../../actions/typeSelector/team';
import ReducerHelper from '../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case TeamSelectorActionTypes.GET_TEAM_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case TeamSelectorActionTypes.GET_TEAM_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case TeamSelectorActionTypes.GET_TEAM_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    case TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case TeamRoleSelectorActionTypes.GET_TEAM_ROLE_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
