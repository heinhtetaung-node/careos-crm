import { combineReducers } from 'redux';

import authReducer from './auth';

const customerReducer = combineReducers({
  authReducer,
});
export default customerReducer;
