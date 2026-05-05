import { IAction, IReduxState } from 'shared/interfaces/common';

import { OrderActionTypes } from '../../actions/order';

const initialState: IReduxState = {
  payload: {
    data: {
      order: {},
    },
  },
  error: null,
  isFetching: false,
  success: true,
};

export default function order(state = initialState, action: IAction<any>) {
  switch (action.type) {
    case OrderActionTypes.GET_DETAIL: {
      return {
        isFetching: true,
        error: null,
        success: false,
      };
    }
    case OrderActionTypes.UPDATE_ORDER_SUCCESS:
    case OrderActionTypes.GET_DETAIL_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...action.payload,
        },
      };
    }

    case OrderActionTypes.UPDATE_CUSTOMER_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          customer: action.payload,
        },
      };
    }

    case OrderActionTypes.UPDATE_DOCUMENT_STATUS_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          documentStatus: action.payload.documentStatus,
        },
      };
    }

    case OrderActionTypes.UPDATE_CUSTOMER_FAILED:
    case OrderActionTypes.UPDATE_ORDER_FAILED:
    case OrderActionTypes.GET_DETAIL_FAILED: {
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
