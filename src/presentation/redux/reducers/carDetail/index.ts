import { GetCarDetailActionTypes } from 'presentation/redux/actions/carDetail';
import ReducerHelper from 'presentation/redux/reducers/helper';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case GetCarDetailActionTypes.GET_CAR_DETAIL:
      return ReducerHelper.baseProcessRequest(state, action);
    case GetCarDetailActionTypes.GET_CAR_DETAIL_SUCCESS:
      return ReducerHelper.baseProcessSuccess(state, action);
    case GetCarDetailActionTypes.GET_CAR_DETAIL_FAIL:
      return ReducerHelper.baseProcessFailed(state, action);
    default:
      return state;
  }
}
