import { combineEpics } from 'redux-observable';

import adminEpic from './admin/team';
import userEpic from './admin/user';
import callEpic from './call';
import carDetailEpic from './carDetail';
import carSubModelEpic from './carSubModel';
import customerProfileEpic from './customerProfile';
import documentEpic from './document';
import initAppEpic from './general/appInitiation';
import changeLanguageEpic from './general/language';
import importEpic from './importFile';
import leadEpic from './lead';
import leadActivityEpic from './leadActivity';
import leadDetailEpic from './leadDetail';
import orderEpic from './order';
import packageEpic from './package';
import presenceEpic from './presence';
import provinceDetailEpic from './provinceDetail';
import selectorEpic from './typeSelector';

const rootEpic = combineEpics(
  leadActivityEpic,
  initAppEpic,
  changeLanguageEpic,
  selectorEpic,
  userEpic,
  adminEpic,
  leadEpic,
  leadDetailEpic,
  presenceEpic,
  callEpic,
  packageEpic,
  importEpic,
  orderEpic,
  carDetailEpic,
  provinceDetailEpic,
  documentEpic,
  customerProfileEpic,
  carSubModelEpic
);

export default rootEpic;
