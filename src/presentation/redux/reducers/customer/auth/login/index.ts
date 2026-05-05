import { IAction, IState } from '../../../../../../shared/interfaces/common';
import {
  LOGIN_USER,
  LOGIN_USER_FAILED,
  LOGIN_USER_SUCCESS,
} from '../../../../actions/customer/auth';
import ReducerHelper from '../../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case LOGIN_USER:
      return ReducerHelper.baseProcessRequest(state, action);
    case LOGIN_USER_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case LOGIN_USER_FAILED:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
