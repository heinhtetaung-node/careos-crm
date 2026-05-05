import { IAction, IState } from 'shared/interfaces/common';
import { ILookUpUser } from 'shared/interfaces/common/admin/user';

import { UserActionTypes } from '../../../../actions/admin/user';

const initialState: IState<ILookUpUser[]> = {
  data: [],
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function lookUpUserReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case UserActionTypes.GET_LOOKUP_USER: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case UserActionTypes.GET_LOOKUP_USER_SUCCESS: {
      const userList = action.payload.selectData;
      return {
        ...state,
        data: userList,
        isFetching: false,
      };
    }
    case UserActionTypes.GET_LOOKUP_USER_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
      };
    }
    default:
      return state;
  }
}
