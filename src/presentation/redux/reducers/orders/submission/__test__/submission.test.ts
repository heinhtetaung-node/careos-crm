import { OrderSubmissionActions } from 'presentation/redux/actions/orders/submission';

import OrderSubmissionReducer from '..';

const initialState = {
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

test('check OrderSubmissionReducer run with OrderSubmissionActions.GET_ORDER_SUBMISSION', () => {
  const action = {
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION,
    payload: {
      data: {
        items: [],
      },
    },
  };
  expect(OrderSubmissionReducer(initialState, action)).not.toEqual(null);
});

test('check OrderSubmissionReducer run with OrderSubmissionActions.GET_ORDER_SUBMISSION_SUCCESS', () => {
  const action = {
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION_SUCCESS,
    payload: {
      data: {
        items: [],
      },
    },
  };
  expect(OrderSubmissionReducer(initialState, action)).not.toEqual(null);
});

test('check OrderSubmissionReducer run with OrderSubmissionActions.GET_ORDER_SUBMISSION_FAILED', () => {
  const action = {
    type: OrderSubmissionActions.GET_ORDER_SUBMISSION_FAILED,
  };
  expect(OrderSubmissionReducer(initialState, action)).not.toEqual(null);
});

test('check OrderSubmissionReducer run with OrderSubmissionActions.UPDATE_ORDER_LIST', () => {
  const action = {
    type: OrderSubmissionActions.UPDATE_ORDER_LIST,
    payload: {
      agentFullName: 'Lorem',
      listCheckBox: [],
    },
  };
  expect(OrderSubmissionReducer(initialState, action)).not.toEqual(null);
});
