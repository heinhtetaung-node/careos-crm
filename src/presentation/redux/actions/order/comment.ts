import { IAction } from 'shared/interfaces/common';

export enum OrderCommentTypes {
  CLEAR_ALL_COMMENT = '[Order] CLEAR_ALL_COMMENT',

  GET_COMMENT = '[Order] GET_COMMENT',
  GET_COMMENT_FAIL = '[Order] GET_COMMENT_FAIL',
  GET_COMMENT_SUCCESS = '[Order] GET_COMMENT_SUCCESS',

  CREATE_ORDER_COMMENT = '[Order] CREATE_ORDER_COMMENT',
  CREATE_ORDER_COMMENT_SUCCESS = '[Order] CREATE_ORDER_COMMENT_SUCCESS',
  CREATE_ORDER_COMMENT_FAIL = '[Order] CREATE_ORDER_COMMENT_FAIL',

  GET_COMMENT_AFTER_CREATE = '[Order] GET_COMMENT_AFTER_CREATE',
  GET_COMMENT_AFTER_CREATE_FAIL = '[Order] GET_COMMENT_AFTER_CREATE_FAIL',
  GET_COMMENT_AFTER_CREATE_SUCCESS = '[Order] GET_COMMENT_AFTER_CREATE_SUCCESS',
}

export const createOrderComment = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.CREATE_ORDER_COMMENT,
  payload,
});

export const createOrderCommentSuccess = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.CREATE_ORDER_COMMENT_SUCCESS,
  payload,
});

export const createOrderCommentFail = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.CREATE_ORDER_COMMENT_FAIL,
  payload,
});

export const clearComment = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.CLEAR_ALL_COMMENT,
  payload,
});

export const getComment = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT,
  payload,
});

export const getCommentFail = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT_FAIL,
  payload,
});

export const getCommentSuccess = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT_SUCCESS,
  payload,
});

export const getCommentAfterCreate = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE,
  payload,
});

export const getCommentAfterCreateFail = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE_FAIL,
  payload,
});

export const getCommentAfterCreateSuccess = (payload?: any): IAction<any> => ({
  type: OrderCommentTypes.GET_COMMENT_AFTER_CREATE_SUCCESS,
  payload,
});
