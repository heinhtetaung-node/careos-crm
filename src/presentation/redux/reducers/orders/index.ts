import { combineReducers } from 'redux';

import ordersAllReducer, { InsurersAll as insurersAllReducer } from './all';
import orderApprovalReducer from './approval';
import orderDocumentsReducer from './documents';
import qcModuleReducer from './qc';
import orderSubmissionReducer from './submission';

const ordersReducer = combineReducers({
  ordersAllReducer,
  insurersAllReducer,
  qcModuleReducer,
  orderSubmissionReducer,
  orderDocumentsReducer,
  orderApprovalReducer,
});

export type OrdersRootStateType = ReturnType<typeof ordersReducer>;
export default ordersReducer;
