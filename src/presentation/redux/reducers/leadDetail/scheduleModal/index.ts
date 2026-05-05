import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadActionTypes } from '../../../actions/leadDetail/scheduleModal';

const initialState: IState<any> = {
  data: {
    loading: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function scheduleReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadActionTypes.SAVE_APPOINTMENT: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadActionTypes.SAVE_APPOINTMENT_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          comments: action.payload,
        },
      };
    }
    case LeadActionTypes.SAVE_APPOINTMENT_FAIL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: false,
          error: action.payload,
        },
      };
    }
    default:
      return state;
  }
}
