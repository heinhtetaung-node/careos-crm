import { combineReducers } from 'redux';

import listReducer from './listImportPackage';

const packageReducer = combineReducers({
  listReducer,
});

export default packageReducer;
