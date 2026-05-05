import {
  formatOrderSubmission,
  formatNumber,
} from 'presentation/components/OrderListingTable/helper';
import { OrdersApprovalActions } from 'presentation/redux/actions/orders/approval';
import { IAction, IState } from 'shared/interfaces/common';

import { updateManualOrderList } from '../helpers';

interface InitialState extends IState<any> {
  totalItem?: number;
  pageState: {
    pageSize: number;
    currentPage: number;
  };
}

const initialState: InitialState = {
  data: [],
  isFetching: false,
  success: true,
  status: '',
  totalItem: 0,
  tableType: '',
  pageState: {
    pageSize: 15,
    currentPage: 1,
  },
};

export default function OrdersApprovalReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case OrdersApprovalActions.GET_ORDERS_APPROVAL: {
      const { pageSize, currentPage } = action.payload;
      return {
        ...state,
        isFetching: true,
        pageState: {
          pageSize: pageSize || state.pageState.pageSize,
          currentPage: currentPage || state.pageState.currentPage,
        },
      };
    }
    case OrdersApprovalActions.GET_ORDERS_APPROVAL_SUCCESS: {
      return {
        ...state,
        data: formatOrderSubmission(action.payload.data.items, 'approvalAgent'),
        success: true,
        isFetching: false,
        totalItem: formatNumber(action.payload?.data?.total),
      };
    }
    case OrdersApprovalActions.GET_ORDERS_APPROVAL_FAILED: {
      return {
        ...state,
        data: [],
        success: false,
        isFetching: false,
        totalItem: 0,
      };
    }
    case OrdersApprovalActions.UPDATE_ORDER_LIST: {
      const { agentFullName, listCheckBox } = action.payload;
      const updatedOrderList = updateManualOrderList({
        data: state.data,
        listCheckBox,
        agentFullName,
      });
      return {
        ...state,
        data: updatedOrderList,
      };
    }
    default:
      return state;
  }
}
