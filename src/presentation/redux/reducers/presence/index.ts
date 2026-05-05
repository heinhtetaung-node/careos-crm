import { IAction, IState } from '../../../../shared/interfaces/common';
import { IPresence } from '../../../../shared/interfaces/common/admin/user';
import { PresenceActionTypes } from '../../actions/presence';

const initialState: IState<IPresence> & { isLogoutSuccess: boolean } = {
  data: {},
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
  isLogoutSuccess: false,
};

export default function presenceReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case PresenceActionTypes.LOGOUT_USER: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case PresenceActionTypes.LOGOUT_USER_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
        isLogoutSuccess: true,
      };
    }
    case PresenceActionTypes.LOGOUT_USER_FAILED: {
      return {
        ...state,
        isFetching: false,
        data: {},
        isLogoutSuccess: false,
      };
    }
    case PresenceActionTypes.UPDATE_PRESENCE: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case PresenceActionTypes.UPDATE_PRESENCE_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: action.payload,
      };
    }
    case PresenceActionTypes.UPDATE_PRESENCE_FAILED: {
      return {
        ...state,
        isFetching: false,
        data: {},
      };
    }

    case PresenceActionTypes.RESET_IS_LOGOUT_SUCCESS: {
      return {
        ...state,
        isLogoutSuccess: false,
      };
    }
    default:
      return state;
  }
}
