import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadActionTypes {
  PUSH_COMMENT = '[LeadsDetail] PUSH_COMMENT',
  PUSH_COMMENT_SUCCESS = '[LeadsDetail] PUSH_COMMENT_SUCCESS',
  PUSH_COMMENT_FAIL = '[LeadsDetail] PUSH_COMMENT_FAIL',
}

export const pushComment = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.PUSH_COMMENT,
  payload,
});

export const pushCommentSuccess = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.PUSH_COMMENT_SUCCESS,
  payload,
});

export const pushCommentFail = (payload?: any): IAction<any> => ({
  type: LeadActionTypes.PUSH_COMMENT_FAIL,
  payload,
});
