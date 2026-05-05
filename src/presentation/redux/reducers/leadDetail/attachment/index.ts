import { customAttachment } from './attachmentReducer.helper';

import { IAction, IState } from '../../../../../shared/interfaces/common';
import { LeadActionTypes } from '../../../actions/leadDetail/email';

const initialState: IState<any> = {
  data: {
    loading: false,
    attachments: [],
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function attachmentReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case LeadActionTypes.GET_ATTACHMENT: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: true,
        },
      };
    }
    case LeadActionTypes.GET_ATTACHMENT_SUCCESS: {
      const customData = customAttachment(action.payload);
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: false,
          attachments: customData,
        },
      };
    }
    case LeadActionTypes.GET_ATTACHMENT_FAIL: {
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
