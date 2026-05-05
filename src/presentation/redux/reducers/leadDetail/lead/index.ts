import { LeadAddEmailActionTypes } from 'presentation/redux/actions/leadDetail/addEmail';
import { LeadAddressActionTypes } from 'presentation/redux/actions/leadDetail/addressModal';
import { LeadCouponActionTypes } from 'presentation/redux/actions/leadDetail/coupon';
import { LeadDetailGetLeadActionTypes } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { LeadRejectionActionTypes } from 'presentation/redux/actions/leadDetail/leadRejection';
import { LeadPhoneActionTypes } from 'presentation/redux/actions/leadDetail/phone';
import { RemarkActions } from 'presentation/redux/actions/leadDetail/remark';
import { LeadCustomerDetailActionTypes } from 'presentation/redux/actions/leadDetail/updateCustomerDetail';
import { LeadDetailUpdateLeadDataActionTypes } from 'presentation/redux/actions/leadDetail/updateLeadData';
import { UpdateLeadImportantActionTypes } from 'presentation/redux/actions/leadDetail/updateLeadImportant';
import { LeadDetailUpdateLeadStatusActionTypes } from 'presentation/redux/actions/leadDetail/updateLeadStatus';
import { IAction, IReduxState } from 'shared/interfaces/common';

const initialState: IReduxState = {
  payload: {
    important: false,
  },
  error: null,
  isFetching: false,
  success: false,
};

export default function UserLead(state = initialState, action: IAction<any>) {
  switch (action.type) {
    case LeadDetailGetLeadActionTypes.GET_LEAD:
    case LeadRejectionActionTypes.LEAD_REJECTION:
    case LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS:
    case LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA:
    case LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL: {
      return {
        isFetching: true,
        payload: state.payload,
        success: false,
        error: false,
      };
    }
    case LeadDetailGetLeadActionTypes.GET_LEAD_SUCCESS:
    case LeadRejectionActionTypes.LEAD_REJECTION_SUCCESS:
    case LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS_SUCCESS:
    case LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL_SUCCESS:
    case LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_SUCCESS:
    case UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT_SUCCESS:
    case RemarkActions.ADD_REMARK_SUCCESS:
    case LeadPhoneActionTypes.ADD_PHONE_SUCCESS:
    case LeadAddEmailActionTypes.ADD_EMAIL_SUCCESS:
    case LeadAddressActionTypes.ADD_ADDRESS_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          ...action.payload,
        },
      };
    }
    case LeadDetailGetLeadActionTypes.GET_LEAD_FAIL:
    case LeadRejectionActionTypes.LEAD_REJECTION_FAIL:
    case LeadDetailUpdateLeadStatusActionTypes.UPDATE_LEAD_STATUS_FAILED:
    case LeadDetailUpdateLeadDataActionTypes.UPDATE_LEAD_DATA_FAILED:
    case RemarkActions.ADD_REMARK_FAIL:
    case LeadCustomerDetailActionTypes.UPDATE_CUSTOMER_DETAIL_FAIL: {
      return {
        success: false,
        isFetching: false,
        payload: state.payload,
        error: action.payload,
      };
    }
    case LeadCouponActionTypes.DELETE_COUPON_SUCCESS:
    case LeadCouponActionTypes.ADD_COUPON_SUCCESS: {
      return {
        isFetching: false,
        error: null,
        success: true,
        payload: {
          ...state.payload,
          data: {
            ...state.payload.data,
            ...action.payload.data,
          },
        },
      };
    }
    default:
      return state;
  }
}
