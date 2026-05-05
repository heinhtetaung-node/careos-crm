import { combineReducers } from 'redux';

import createTeamReducer from './createTeam';
import editReducer from './editTeam';
import listReducer from './listTeam';
import listTeamNameReducer from './listTeamName';
import teamDetailReducer from './teamDetail';

const teamReducer = combineReducers({
  createTeamReducer,
  listReducer,
  editReducer,
  listTeamNameReducer,
  teamDetailReducer,
});

export default teamReducer;
