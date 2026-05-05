import { combineReducers } from 'redux';

import loginReducer from './login';

const authReducer = combineReducers({
  loginReducer,
});
export default authReducer;
