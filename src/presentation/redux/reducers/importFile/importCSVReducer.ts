import { ImportFileAction } from 'presentation/redux/actions/importFile/index';
import { IAction, IReduxState } from 'shared/interfaces/common';

const initialState: IReduxState = {
  payload: {},
  error: null,
  isFetching: false,
  success: true,
};

export default function importCSVReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case ImportFileAction.IMPORT_CSV: {
      return {
        ...state,
        isFetching: true,
        success: false,
        error: false,
      };
    }
    case ImportFileAction.IMPORT_CSV_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          ...action.payload,
        },
      };
    }
    case ImportFileAction.IMPORT_CSV_FAILED: {
      return {
        success: false,
        isFetching: false,
        payload: state.payload,
        error: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
