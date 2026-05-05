import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadSmsActionTypes } from '../../../actions/leadDetail/sms';

const initialState: IState<any> = {
  data: {
    loading: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function smsReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadSmsActionTypes.SEND_SMS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadSmsActionTypes.SEND_SMS_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          sms: action.payload,
        },
      };
    }
    case LeadSmsActionTypes.SEND_SMS_FAIL: {
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
