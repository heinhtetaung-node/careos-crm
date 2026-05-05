import { LeadRejectRecordingActions } from 'presentation/redux/actions/leads/lead-reject-recording';

import { IAction, IState } from '../../../../../shared/interfaces/common';

const initialState: IState<any> = {
  data: {},
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function leadRecordingReducers(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING_SUCCESS: {
      return {
        ...state,
        success: true,
        isFetching: false,
        data: {
          ...action.payload,
        },
      };
    }
    case LeadRejectRecordingActions.GET_LEAD_REJECT_RECORDING_FAILED: {
      return {
        ...state,
        data: {
          ...action?.error,
        },
        success: false,
        isFetching: false,
      };
    }
    default:
      return state;
  }
}
