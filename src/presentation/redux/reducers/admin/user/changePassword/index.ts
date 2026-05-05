import { IAction, IState } from '../../../../../../shared/interfaces/common';
import ReducerHelper from '../../../helper';

const initialState: IState<string> = ReducerHelper.baseReducer();

export default function (
  state = initialState,
  action: IAction<any>
): IState<any> {
  switch (action.type) {
    default:
      return state;
  }
}
