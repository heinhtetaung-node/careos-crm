import { ImportFileAction } from 'presentation/redux/actions/importFile/index';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<any> = {
  data: {},
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function setFileReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case ImportFileAction.SET_FILE: {
      return {
        ...state,
        data: {
          content: action.payload,
        },
      };
    }
    case ImportFileAction.SET_FILE_FAIL: {
      return {
        ...state,
        data: {
          error: action.payload,
        },
      };
    }
    case ImportFileAction.RESET_FILE: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}
