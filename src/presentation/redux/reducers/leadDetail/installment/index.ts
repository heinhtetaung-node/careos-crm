import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';
import { IAction, IReduxState } from 'shared/interfaces/common';

import getInstallmentData from './helper';

const initialState: IReduxState & { installment: any } = {
  payload: {},
  error: null,
  success: true,
  installment: [],
  isFetching: false,
};

export default function InstallmentReducer(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case LeadDetailActionTypes.GET_INSTALLMENT: {
      return {
        isFetching: true,
      };
    }
    case LeadDetailActionTypes.GET_INSTALLMENT_SUCCESS: {
      const getInstallment = getInstallmentData(action.payload);

      return {
        isFetching: false,
        installment: getInstallment,
      };
    }
    case LeadDetailActionTypes.GET_INSTALLMENT_FAILURE: {
      return {
        isFetching: false,
      };
    }
    default:
      return state;
  }
}
