import { LeadRejectRecordingActions } from 'presentation/redux/actions/leads/lead-reject-recording';

import { IAction, IState } from '../../../../../shared/interfaces/common';

const initialState: IState<any> = {
  data: {},
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function leadParticipantReducers(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS_SUCCESS: {
      return {
        ...state,
        success: true,
        isFetching: false,
        data: {
          ...action.payload?.data,
        },
      };
    }
    case LeadRejectRecordingActions.GET_LEAD_REJECT_PARTICIPANTS_FAILED: {
      return {
        ...state,
        data: {},
        success: false,
        isFetching: false,
      };
    }
    default:
      return state;
  }
}
