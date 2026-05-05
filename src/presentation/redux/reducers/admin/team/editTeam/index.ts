import { TeamActionTypes } from 'presentation/redux/actions/admin/team';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<any> = ReducerHelper.baseReducer();

export default function (
  state = initialState,
  action: IAction<any>
): IState<any> {
  switch (action.type) {
    case TeamActionTypes.EDIT_TEAM: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case TeamActionTypes.EDIT_TEAM_SUCCESS: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    case TeamActionTypes.EDIT_TEAM_FAILED: {
      return ReducerHelper.baseProcessRequest(state, action);
    }
    default:
      return state;
  }
}
