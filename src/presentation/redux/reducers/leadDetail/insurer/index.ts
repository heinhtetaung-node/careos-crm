import { LeadInsurerActionTypes } from 'presentation/redux/actions/leadDetail/insurer';
import { IAction, IState } from 'shared/interfaces/common';

import { formatDataListInsurers } from './insurerHelper';

const initialState: IState<any> = {
  data: {
    agent: [],
    loading: false,
    calling: false,
    error: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function getListInsurerReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadInsurerActionTypes.GET_LIST_INSURER: {
      return {
        ...state,
        isFetching: true,
        data: {
          ...state.data,
          loading: true,
          error: false,
        },
      };
    }
    case LeadInsurerActionTypes.GET_LIST_INSURER_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          listInsurer: formatDataListInsurers(action.payload),
          loading: false,
        },
      };
    }
    case LeadInsurerActionTypes.GET_LIST_INSURER_FAIL: {
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
