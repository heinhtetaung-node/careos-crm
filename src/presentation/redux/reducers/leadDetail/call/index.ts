import { IAction, IState } from 'shared/interfaces/common';

import { LeadDetailActionTypes } from '../../../actions/leads/detail';

export enum CallStatus {
  Idle,
  Calling,
  Connecting,
  Join,
  End,
}

export const initialState: IState<any> = {
  data: {
    loading: false,
    callStatus: CallStatus.Idle,
    callName: '',
    timer: 0,
    sdpAnswer: {},
    sdpAnswerResource: '',
    audioStream: null,
    hasShowedSummary: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function callReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadDetailActionTypes.INITIAL_CALL: {
      return {
        ...initialState,
      };
    }

    case LeadDetailActionTypes.CREATE_REJECTION: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadDetailActionTypes.SET_AUDIO_STREAM: {
      return {
        ...state,
        data: {
          ...state.data,
          audioStream: action.payload,
        },
      };
    }
    case LeadDetailActionTypes.CREATE_REJECTION_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
        },
      };
    }
    case LeadDetailActionTypes.CREATE_REJECTION_FAILED: {
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
    case LeadDetailActionTypes.CALLING: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          callStatus: CallStatus.Calling,
        },
      };
    }

    case LeadDetailActionTypes.CONNECTED_CALL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          callName: action.payload.callName,
          sdpAnswer: action.payload.sdpAnswer,
          sdpAnswerResource:
            action.payload.sdpAnswerResource || state.data.sdpAnswerResource,
          callStatus: CallStatus.Connecting,
        },
      };
    }

    case LeadDetailActionTypes.JOIN_CALL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          callStatus: CallStatus.Join,
        },
      };
    }

    case LeadDetailActionTypes.CALL_TIMER: {
      return {
        ...state,
        data: {
          ...state.data,
          timer: action.payload,
        },
      };
    }

    case LeadDetailActionTypes.FAILED_CALL:
    case LeadDetailActionTypes.END_CALL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          callStatus: CallStatus.End,
        },
      };
    }

    case LeadDetailActionTypes.GET_CALL_PARTICIPANTS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          callParticipants: action.payload.participants,
        },
      };
    }

    case LeadDetailActionTypes.SET_HAS_SHOWED_SUMMARY: {
      return {
        ...state,
        data: {
          ...state.data,
          hasShowedSummary: action.payload,
        },
      };
    }

    default:
      return state;
  }
}
