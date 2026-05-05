import { combineReducers } from 'redux';

import listReducer from './listSource';
import sourceReducer from './sources';

const leadSourceReducer = combineReducers({
  listReducer,
  sourceReducer,
});
export default leadSourceReducer;
