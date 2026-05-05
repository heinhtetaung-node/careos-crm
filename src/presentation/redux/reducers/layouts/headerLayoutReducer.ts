import { IAction, IState } from '../../../../shared/interfaces/common';
import { LayoutActionTypes } from '../../actions/theme/layoutActions';
import ReducerHelper from '../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case LayoutActionTypes.GET_LAYOUT_CONFIG:
      return ReducerHelper.baseProcessRequest(state, action);
    case LayoutActionTypes.GET_LAYOUT_CONFIG_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case LayoutActionTypes.GET_LAYOUT_CONFIG_FAILED:
      return ReducerHelper.baseProcessFailed(state, action);
    case LayoutActionTypes.CLEAR_LAYOUT_CONFIG:
      return { ...state, ...initialState };
    default:
      return state;
  }
}
