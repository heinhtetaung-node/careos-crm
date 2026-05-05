import { combineReducers } from 'redux';

import listReducer from './listImportCarSubModel';

const carSubModelReducer = combineReducers({
  listReducer,
});

export default carSubModelReducer;
