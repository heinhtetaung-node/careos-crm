import { IAction, IState } from '../../../../shared/interfaces/common';
import {
  CHANGE_LANGUAGE,
  CHANGE_LANGUAGE_SUCCESS,
  CHANGE_LANGUAGE_FAILED,
} from '../../actions/languages';
import ReducerHelper from '../helper';

const initialState: IState<any> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return ReducerHelper.baseProcessRequest(state, action);
    case CHANGE_LANGUAGE_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case CHANGE_LANGUAGE_FAILED:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
