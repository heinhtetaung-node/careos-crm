import { combineEpics } from 'redux-observable';

import {
  getCommentEpic,
  getCommentAfterCreateEpic,
  subscribeCommentUpdatesEpic,
} from './comment';
import subscribeMailUpdatesEpic from './mail';

const leadActivityEpic = combineEpics(
  getCommentEpic,
  getCommentAfterCreateEpic,
  subscribeCommentUpdatesEpic,
  subscribeMailUpdatesEpic
);

export default leadActivityEpic;
