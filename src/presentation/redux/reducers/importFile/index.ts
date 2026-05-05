import { combineReducers } from 'redux';

import importCSVReducer from './importCSVReducer';
import setFileReducer from './setFileReducer';

const importFileReducer = combineReducers({
  importCSVReducer,
  setFileReducer,
});
export default importFileReducer;
