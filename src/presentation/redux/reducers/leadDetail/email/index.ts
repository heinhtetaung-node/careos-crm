import emailUpdater from './emailReducer.helper';

import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadAddEmailActionTypes } from '../../../actions/leadDetail/addEmail';
import { LeadActionTypes } from '../../../actions/leadDetail/email';

export const initialState: IState<any> = {
  data: {
    loading: false,
    emails: [],
    fileUploadUrl: '',
    unReadMails: 0,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function emailReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadActionTypes.GET_LIST_EMAIL:
    case LeadActionTypes.SEND_EMAIL: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadActionTypes.GET_LIST_EMAIL_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          emails: action.payload,
        },
      };
    }
    case LeadActionTypes.GET_LIST_EMAIL_FAIL:
    case LeadActionTypes.SEND_EMAIL_FAIL: {
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
    case LeadActionTypes.SEND_EMAIL_SUCCESS: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
        },
      };
    }
    case LeadActionTypes.ADD_ATTACHMENT_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          fileUploadUrl: action.payload,
          loading: false,
        },
      };
    }
    case LeadAddEmailActionTypes.REPLY_EMAIL: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          emailReplyTo: action.payload,
        },
      };
    }
    case LeadActionTypes.UPDATE_EMAIL_INFORMATION_SUCCESS: {
      const newEmailData = emailUpdater(action.payload, state.data);
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          emails: newEmailData,
        },
      };
    }
    case LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          unReadMails: action.payload?.count || 0,
        },
      };
    }
    case LeadActionTypes.INCREMENT_MAIL_READ_COUNT: {
      return {
        ...state,
        data: {
          ...state.data,
          unReadMails: state.data.unReadMails + 1,
        },
      };
    }
    case LeadActionTypes.DECREMENT_MAIL_READ_COUNT: {
      return {
        ...state,
        data: {
          ...state.data,
          unReadMails:
            state.data.unReadMails > 0 ? state.data.unReadMails - 1 : 0,
        },
      };
    }
    default:
      return state;
  }
}
