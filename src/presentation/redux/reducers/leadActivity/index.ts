import { combineReducers } from 'redux';

import comment from './comment';

const leadActivityReducer = combineReducers({
  comment,
});

export default leadActivityReducer;
