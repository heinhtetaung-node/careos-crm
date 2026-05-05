import { TeamActionTypes } from 'presentation/redux/actions/admin/team';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, actions: IAction<any>) {
  switch (actions.type) {
    case TeamActionTypes.CREATE_TEAM:
      return ReducerHelper.baseProcessRequest(state, actions);
    case TeamActionTypes.CREATE_TEAM_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, actions);
    case TeamActionTypes.CREATE_TEAM_FAIL:
      return ReducerHelper.baseProcessFailed(state, actions);
    default:
      return state;
  }
}
