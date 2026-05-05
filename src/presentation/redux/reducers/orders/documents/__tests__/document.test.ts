import { OrdersDocumentsActions } from 'presentation/redux/actions/orders/documents';

import QCModuleReducer from '..';

const initialState = {
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

test('check QCModuleReducer run with OrdersDocumentsActions.GET_QC_MODULE', () => {
  const action = {
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS,
    payload: {
      data: {
        orders: [],
      },
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with OrdersDocumentsActions.GET_QC_MODULE_SUCCESS', () => {
  const action = {
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_SUCCESS,
    payload: {
      data: {
        orders: [],
      },
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with OrdersDocumentsActions.GET_QC_MODULE_FAILED', () => {
  const action = {
    type: OrdersDocumentsActions.GET_ORDERS_DOCUMENTS_FAILED,
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with OrdersDocumentsActions.GET_QC_MODULE_FAILED', () => {
  const action = {
    type: OrdersDocumentsActions.UPDATE_ORDER_LIST,
    payload: {
      agentFullName: 'Lorem',
      listCheckBox: [],
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});
