import { LeadCarActionTypes } from 'presentation/redux/actions/leadDetail/car';
import { IAction, IState } from 'shared/interfaces/common';

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

export default function getCarBrandReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadCarActionTypes.GET_CAR_BRAND: {
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
    case LeadCarActionTypes.GET_CAR_BRAND_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          carBrand: action.payload,
          loading: false,
        },
      };
    }
    case LeadCarActionTypes.GET_CAR_BRAND_FAIL: {
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
