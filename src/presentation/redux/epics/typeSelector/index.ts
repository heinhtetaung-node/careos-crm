import { combineEpics } from 'redux-observable';

import getLeadTypeSelectorTypesEpic from './leadType';
import getProductSelectorTypesEpic from './product';
import getRoleSelectorTypesEpic from './role';
import getTeamSelectorTypesEpic from './team';
import getUserSelectorTypesEpic from './user';

const selectorEpic = combineEpics(
  getProductSelectorTypesEpic,
  getTeamSelectorTypesEpic,
  getRoleSelectorTypesEpic,
  getUserSelectorTypesEpic,
  getLeadTypeSelectorTypesEpic
);
export default selectorEpic;
