import { combineReducers } from 'redux';

import managerSelectorReducer from './manager';
import supervisorSelectorReducer from './supervisor';

const userSelectorReducer = combineReducers({
  managerSelectorReducer,
  supervisorSelectorReducer,
});

export default userSelectorReducer;
