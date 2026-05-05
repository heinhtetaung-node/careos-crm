import { QCModuleActions } from 'presentation/redux/actions/orders/qc';

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

test('check QCModuleReducer run with QCModuleActions.GET_QC_MODULE', () => {
  const action = {
    type: QCModuleActions.GET_QC_MODULE,
    payload: {
      data: {
        orders: [],
      },
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with QCModuleActions.GET_QC_MODULE_SUCCESS', () => {
  const action = {
    type: QCModuleActions.GET_QC_MODULE_SUCCESS,
    payload: {
      data: {
        orders: [],
      },
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with QCModuleActions.GET_QC_MODULE_FAILED', () => {
  const action = {
    type: QCModuleActions.GET_QC_MODULE_FAILED,
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});

test('check QCModuleReducer run with QCModuleActions.GET_QC_MODULE_FAILED', () => {
  const action = {
    type: QCModuleActions.UPDATE_ORDER_LIST,
    payload: {
      agentFullName: 'Lorem',
      listCheckBox: [],
    },
  };
  expect(QCModuleReducer(initialState, action)).not.toEqual(null);
});
