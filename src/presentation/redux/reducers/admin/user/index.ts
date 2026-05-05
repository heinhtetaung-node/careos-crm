import { combineReducers } from 'redux';

import changePasswordReducer from './changePassword';
import createUserReducer from './createUser';
import editUserReducer from './editUser';
import importUserReducer from './importUser';
import listCreatedByReducer from './listCreatedBy';
import listReducer from './listUser';
import lookUpUserReducer from './lookUpUser';
import profileReducer from './profile';

const userReducer = combineReducers({
  profileReducer,
  changePasswordReducer,
  createUserReducer,
  listReducer,
  editUserReducer,
  listCreatedByReducer,
  importUserReducer,
  lookUpUserReducer,
});
export default userReducer;
