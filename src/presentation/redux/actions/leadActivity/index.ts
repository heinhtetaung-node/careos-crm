import {
  clearComment,
  getComment,
  getCommentFail,
  getCommentSuccess,
  getCommentAfterCreate,
  getCommentAfterCreateFail,
  getCommentAfterCreateSuccess,
} from './comment';
import subscribeLeadMailUpdates from './mail';

// INFO: Set Leads File Information
export enum LeadActivityTypes {
  CLEAR_ALL_COMMENT = '[LeadActivity] CLEAR_ALL_COMMENT',

  GET_COMMENT = '[LeadActivity] GET_COMMENT',
  GET_COMMENT_FAIL = '[LeadActivity] GET_COMMENT_FAIL',
  GET_COMMENT_SUCCESS = '[LeadActivity] GET_COMMENT_SUCCESS',

  GET_COMMENT_AFTER_CREATE = '[LeadActivity] GET_COMMENT_AFTER_CREATE',
  GET_COMMENT_AFTER_CREATE_FAIL = '[LeadActivity] GET_COMMENT_AFTER_CREATE_FAIL',
  GET_COMMENT_AFTER_CREATE_SUCCESS = '[LeadActivity] GET_COMMENT_AFTER_CREATE_SUCCESS',

  SUBSCRIBE_LEAD_COMMENT_UPDATES = '[LeadActivity] SUBSCRIBE_LEAD_COMMENT_UPDATES',
  SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS = '[LeadActivity] SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS',

  SUBSCRIBE_LEAD_MAIL_UPDATES = '[LeadActivity] SUBSCRIBE_LEAD_MAIL_UPDATES',
}

export {
  clearComment,
  getComment,
  getCommentFail,
  getCommentSuccess,
  getCommentAfterCreate,
  getCommentAfterCreateFail,
  getCommentAfterCreateSuccess,
  subscribeLeadMailUpdates,
};
