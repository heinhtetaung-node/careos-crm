import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';
import { IAction, IReduxState } from 'shared/interfaces/common';

const initialState: IReduxState = {
  payload: {},
  error: null,
  isFetching: false,
  success: true,
};

export default function SummaryModal(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadDetailActionTypes.HANDLE_SUMMARY_MODAL: {
      return {
        isFetching: true,
        payload: state.payload,
        success: false,
        error: false,
      };
    }
    case LeadDetailActionTypes.HANDLE_SUMMARY_MODAL_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          ...action.payload,
        },
      };
    }
    case LeadDetailActionTypes.HANDLE_SUMMARY_MODAL_FAILURE: {
      return {
        success: false,
        isFetching: false,
        payload: state.payload,
        error: action.payload,
      };
    }
    default:
      return state;
  }
}
