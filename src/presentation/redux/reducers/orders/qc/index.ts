import {
  formatOrderDocuments,
  formatNumber,
} from 'presentation/components/OrderListingTable/helper';
import { QCModuleActions } from 'presentation/redux/actions/orders/qc';
import { IAction, IState } from 'shared/interfaces/common';

import { updateManualOrderList } from '../helpers';

const initialState: IState<any> & { totalItem?: number } & {
  pageState: any;
  listCheckBox?: any;
} = {
  data: [],
  listCheckBox: [],
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

export default function QCModuleReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case QCModuleActions.GET_QC_MODULE: {
      const { pageSize, currentPage, orderBy } = action.payload;
      return {
        ...state,
        isFetching: true,
        pageState: {
          pageSize: pageSize || state.pageState.pageSize,
          currentPage: currentPage || state.pageState.currentPage,
          orderBy,
        },
      };
    }
    case QCModuleActions.GET_QC_MODULE_SUCCESS: {
      const formatOrders = formatOrderDocuments(
        action.payload.data.orders,
        'qcAgent'
      );
      return {
        ...state,
        data: formatOrders,
        success: true,
        isFetching: false,
        totalItem: formatNumber(action.payload.data.total),
      };
    }
    case QCModuleActions.GET_QC_MODULE_FAILED: {
      return {
        ...state,
        data: [],
        success: false,
        isFetching: false,
        totalItem: 0,
      };
    }
    case QCModuleActions.UPDATE_ORDER_LIST: {
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
    case QCModuleActions.RESET_PAGE_STATE: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}
