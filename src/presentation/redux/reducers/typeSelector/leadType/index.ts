import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadTypeSelectorActionTypes } from '../../../actions/typeSelector/leadType';
import ReducerHelper from '../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case LeadTypeSelectorActionTypes.GET_LEAD_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case LeadTypeSelectorActionTypes.GET_LEAD_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case LeadTypeSelectorActionTypes.GET_LEAD_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
