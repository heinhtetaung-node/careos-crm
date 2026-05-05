import { IAction } from 'shared/interfaces/common';

import { LeadActivityTypes } from '.';

const clearComment = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.CLEAR_ALL_COMMENT,
  payload,
});

const getComment = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT,
  payload,
});

const getCommentFail = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT_FAIL,
  payload,
});

const getCommentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT_SUCCESS,
  payload,
});

const getCommentAfterCreate = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT_AFTER_CREATE,
  payload,
});

const getCommentAfterCreateFail = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT_AFTER_CREATE_FAIL,
  payload,
});

const getCommentAfterCreateSuccess = (payload?: any): IAction<any> => ({
  type: LeadActivityTypes.GET_COMMENT_AFTER_CREATE_SUCCESS,
  payload,
});

const subscribeLeadCommentUpdates = (payload: {
  leadName: string;
}): IAction<any> => ({
  type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES,
  payload,
});

const subscribeLeadCommentUpdatesSuccess = (payload: any): IAction<any> => ({
  type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS,
  payload,
});

export {
  clearComment,
  getComment,
  getCommentSuccess,
  getCommentFail,
  getCommentAfterCreate,
  getCommentAfterCreateFail,
  getCommentAfterCreateSuccess,
  subscribeLeadCommentUpdates,
  subscribeLeadCommentUpdatesSuccess,
};
