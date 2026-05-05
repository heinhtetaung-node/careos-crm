import { RemarkActions } from 'presentation/redux/actions/leadDetail/remark';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<unknown> = {
  isFetching: false,
  success: true,
};

export default function updateLeadImportant(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case RemarkActions.ADD_REMARK: {
      return {
        isFetching: true,
        success: false,
      };
    }
    case RemarkActions.ADD_REMARK_SUCCESS: {
      return {
        isFetching: false,
        success: true,
      };
    }
    case RemarkActions.ADD_REMARK_FAIL: {
      return {
        isFetching: false,
        success: false,
      };
    }
    default:
      return state;
  }
}
