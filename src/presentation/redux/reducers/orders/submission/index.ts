import {
  formatNumber,
  formatOrderSubmission,
} from 'presentation/components/OrderListingTable/helper';
import { OrderSubmissionActions } from 'presentation/redux/actions/orders/submission';
import { IAction, IState } from 'shared/interfaces/common';

import { updateManualOrderList } from '../helpers';

const initialState: IState<any> & { totalItem?: number } & {
  pageState: any;
} = {
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

export default function OrderSubmissionReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case OrderSubmissionActions.GET_ORDER_SUBMISSION: {
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
    case OrderSubmissionActions.GET_ORDER_SUBMISSION_SUCCESS: {
      return {
        ...state,
        data: formatOrderSubmission(
          action.payload.data.items,
          'submissionAgent'
        ),
        success: true,
        isFetching: false,
        totalItem: formatNumber(action.payload?.data?.total),
      };
    }
    case OrderSubmissionActions.UPDATE_ORDER_LIST: {
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
    case OrderSubmissionActions.GET_ORDER_SUBMISSION_FAILED: {
      return {
        ...state,
        data: [],
        success: false,
        isFetching: false,
        totalItem: 0,
      };
    }
    case OrderSubmissionActions.RESET_PAGE_STATE: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}
