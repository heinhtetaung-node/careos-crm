import { combineReducers } from 'redux';

import listReducer from './listImportCustomerProfile';

const customerProfileReducer = combineReducers({
  listReducer,
});

export default customerProfileReducer;
