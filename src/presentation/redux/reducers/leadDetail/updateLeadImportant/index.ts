import { UpdateLeadImportantActionTypes } from 'presentation/redux/actions/leadDetail/updateLeadImportant';
import { IAction, IState } from 'shared/interfaces/common';

const initialState: IState<unknown> = {
  isFetching: false,
  success: true,
};

export default function updateLeadImportant(
  state = initialState,
  action: IAction<any>
) {
  switch (action.type) {
    case UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT: {
      return {
        isFetching: true,
      };
    }
    case UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT_SUCCESS:
    case UpdateLeadImportantActionTypes.UPDATE_LEAD_IMPORTANT_FAILED: {
      return {
        isFetching: false,
      };
    }
    default:
      return state;
  }
}
