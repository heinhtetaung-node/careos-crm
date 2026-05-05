import { TeamSelectorActionTypes } from 'presentation/redux/actions/typeSelector/team';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case TeamSelectorActionTypes.GET_ALL_TEAMS:
      return ReducerHelper.baseProcessRequest(state, action);
    case TeamSelectorActionTypes.GET_ALL_TEAMS_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case TeamSelectorActionTypes.GET_ALL_TEAMS_FAILED:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
