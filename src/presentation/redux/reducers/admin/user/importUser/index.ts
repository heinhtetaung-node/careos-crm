import { IAction } from '../../../../../../shared/interfaces/common';
import { UserActionTypes } from '../../../../actions/admin/user';

interface IImportUser {
  isLoading: 'idle' | 'loading';
  importUserSuccess: 'idle' | 'success' | 'failed';
  error: string;
  message: string;
}

const initialState: IImportUser = {
  error: '',
  isLoading: 'idle',
  importUserSuccess: 'idle',
  message: '',
};

export default function importUserReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case UserActionTypes.IMPORT_USER: {
      return {
        ...state,
        isLoading: 'loading',
      };
    }
    case UserActionTypes.IMPORT_USER_SUCCESS: {
      return {
        ...state,
        isLoading: 'idle',
        importUserSuccess: 'success',
        message: action.payload,
        error: '',
      };
    }
    case UserActionTypes.IMPORT_USER_FAILED: {
      return {
        ...state,
        message: '',
        isLoading: 'idle',
        importUserSuccess: 'failed',
        error: action.payload,
      };
    }

    case UserActionTypes.SET_IMPORT_USER_FLAG: {
      return {
        ...state,
        importUserSuccess: action.payload,
      };
    }
    default:
      return state;
  }
}
