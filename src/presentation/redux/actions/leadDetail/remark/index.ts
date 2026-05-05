import { IAction } from 'shared/interfaces/common';

export enum RemarkActions {
  ADD_REMARK = '[LeadsDetail] ADD_REMARK',
  ADD_REMARK_SUCCESS = '[LeadsDetail] ADD_REMARK_SUCCESS',
  ADD_REMARK_FAIL = '[LeadsDetail] ADD_REMARK_FAIL',
}

export const addRemark = (payload?: any): IAction<any> => ({
  type: RemarkActions.ADD_REMARK,
  payload,
});

export const addRemarkSuccess = (payload?: any): IAction<any> => ({
  type: RemarkActions.ADD_REMARK_SUCCESS,
  payload,
});

export const addRemarkFail = (payload?: any): IAction<any> => ({
  type: RemarkActions.ADD_REMARK_FAIL,
  payload,
});
