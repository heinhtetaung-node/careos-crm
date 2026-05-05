import { AssignmentPayload, IAction } from 'shared/interfaces/common';

export enum OrdersApprovalActions {
  GET_ORDERS_APPROVAL = '[Order] GET_ORDERS_APPROVAL',
  GET_ORDERS_APPROVAL_SUCCESS = '[Order] GET_ORDERS_APPROVAL_SUCCESS ',
  GET_ORDERS_APPROVAL_FAILED = '[Order] GET_ORDERS_APPROVAL_FAILED',
  RESET_PAGE_STATE = '[Order] GET_ORDERS_APPROVAL_RESET_ALL',
  UPDATE_ORDER_LIST = '[Order] UPDATE_ORDER_APPROVAL_LIST',
}

export const getOrdersApproval = (payload?: any): IAction<any> => ({
  type: OrdersApprovalActions.GET_ORDERS_APPROVAL,
  payload,
});

export const getOrdersApprovalSuccess = (payload?: any): IAction<any> => ({
  type: OrdersApprovalActions.GET_ORDERS_APPROVAL_SUCCESS,
  payload,
});

export const getOrdersApprovalFailed = (payload?: any): IAction<any> => ({
  type: OrdersApprovalActions.GET_ORDERS_APPROVAL_FAILED,
  payload,
});

export const resetPageStates = (): IAction<any> => ({
  type: OrdersApprovalActions.RESET_PAGE_STATE,
});

export const updateAssigneeOrderApprovalList = (
  payload?: AssignmentPayload
): IAction<any> => ({
  type: OrdersApprovalActions.UPDATE_ORDER_LIST,
  payload,
});
