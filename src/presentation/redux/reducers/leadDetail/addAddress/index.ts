import { LeadAddressActionTypes } from 'presentation/redux/actions/leadDetail/addressModal';
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

export default function addAddressReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadAddressActionTypes.ADD_ADDRESS: {
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
    case LeadAddressActionTypes.ADD_ADDRESS_SUCCESS: {
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
    case LeadAddressActionTypes.ADD_ADDRESS_FAIL: {
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
