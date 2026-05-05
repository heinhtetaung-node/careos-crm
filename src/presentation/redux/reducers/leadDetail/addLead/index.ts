import { LeadDetailAddLeadActionTypes } from 'presentation/redux/actions/leadDetail/addLead';
import { IAction, IState } from 'shared/interfaces/common';

interface IData {
  loading: boolean;
  calling: boolean;
  error: boolean;
}

const initialState: IState<IData> = {
  data: {
    loading: false,
    calling: false,
    error: false,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

export default function addLeadReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadDetailAddLeadActionTypes.ADD_LEAD: {
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
    case LeadDetailAddLeadActionTypes.ADD_LEAD_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          loading: false,
          error: false,
        },
      };
    }
    case LeadDetailAddLeadActionTypes.ADD_LEAD_FAIL: {
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
