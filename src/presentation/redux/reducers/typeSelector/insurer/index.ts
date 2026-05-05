import { IAction, IState } from '../../../../../shared/interfaces/common';
import { InsurersSelectorActionTypes } from '../../../actions/typeSelector/insurer';
import ReducerHelper from '../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case InsurersSelectorActionTypes.GET_ALL_INSURERS_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
