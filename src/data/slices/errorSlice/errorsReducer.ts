import { combineReducers } from 'redux';

import { reducer as leadDetailErrorReducer } from './leadDetailError';

export { errorReducerKey } from './constants';

export const errorReducer = combineReducers({
  ...leadDetailErrorReducer,
});
