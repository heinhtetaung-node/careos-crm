import { IAction, IState } from '../../../../../shared/interfaces/common';
import { ProductSelectorActionTypes } from '../../../actions/typeSelector/product';
import ReducerHelper from '../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case ProductSelectorActionTypes.GET_PRODUCT_TYPES:
      return ReducerHelper.baseProcessRequest(state, action);
    case ProductSelectorActionTypes.GET_PRODUCT_TYPES_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case ProductSelectorActionTypes.GET_PRODUCT_TYPES_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
