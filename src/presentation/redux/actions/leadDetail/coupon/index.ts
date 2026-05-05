import { IAction } from '../../../../../shared/interfaces/common';

// INFO: Set Leads File Information
export enum LeadCouponActionTypes {
  ADD_COUPON = '[LeadsDetail] ADD_COUPON',
  ADD_COUPON_SUCCESS = '[LeadsDetail] ADD_COUPON_SUCCESS',
  ADD_COUPON_FAIL = '[LeadsDetail] ADD_COUPON_FAIL',

  DELETE_COUPON = '[LeadsDetail] DELETE_COUPON',
  DELETE_COUPON_SUCCESS = '[LeadsDetail] DELETE_COUPON_SUCCESS',
  DELETE_COUPON_FAIL = '[LeadsDetail] DELETE_COUPON_FAIL',
}

export const addCoupon = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.ADD_COUPON,
  payload,
});

export const addCouponSuccess = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.ADD_COUPON_SUCCESS,
  payload,
});

export const addCouponFail = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.ADD_COUPON_FAIL,
  payload,
});

export const deleteCoupon = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.DELETE_COUPON,
  payload,
});

export const deleteCouponSuccess = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.DELETE_COUPON_SUCCESS,
  payload,
});

export const deleteCouponFail = (payload?: any): IAction<any> => ({
  type: LeadCouponActionTypes.DELETE_COUPON_FAIL,
  payload,
});
