import { combineReducers } from 'redux';

import allTeamsSelectorReducer from './allTeams';
import globalProductSelectorReducer from './globalProduct';
import insurerSelectorReducer from './insurer';
import leadTypeSelectorReducer from './leadType';
import productSelectorReducer from './product';
import roleSelectorReducer from './role';
import teamSelectorReducer from './team';
import userSelectorReducer from './user';

const typeSelectorReducer = combineReducers({
  teamSelectorReducer,
  allTeamsSelectorReducer,
  userSelectorReducer,
  roleSelectorReducer,
  productSelectorReducer,
  leadTypeSelectorReducer,
  globalProductSelectorReducer,
  insurerSelectorReducer,
});
export default typeSelectorReducer;
