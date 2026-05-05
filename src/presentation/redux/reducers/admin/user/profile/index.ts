import { IAction, IState } from '../../../../../../shared/interfaces/common';
import ReducerHelper from '../../../helper';

const initialState: IState<any> = ReducerHelper.baseReducer();

export default function (
  state = initialState,
  _action: IAction<any>
): IState<any> {
  return state;
}
