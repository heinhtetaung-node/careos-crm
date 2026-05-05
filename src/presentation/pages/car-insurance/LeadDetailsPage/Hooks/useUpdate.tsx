import { useDispatch } from 'react-redux';

import { useUpdateCustomerMutation } from 'data/slices/customerSlice';
import { UpdateCustomerPayload } from 'data/slices/customerSlice/types';
import {
  UpdateLeadJsonPayload,
  useUpdateLeadJsonMutation,
} from 'data/slices/leadDetailSlices/updateLeadSlice';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

interface ISnackBarMessageProps {
  message: string;
  status: string;
}
const displaySnackBarMessage = ({ message, status }: ISnackBarMessageProps) =>
  showSnackBar({
    isOpen: true,
    message: getString(message),
    status,
  });

export function useUpdateLead() {
  const [_updateLead, _statusObj] = useUpdateLeadJsonMutation();
  const dispatch = useDispatch();

  const updateLead = async (payload: UpdateLeadJsonPayload) => {
    let message = 'text.updateLeadSuccess';
    let status = CONSTANTS.snackBarConfig.type.success;
    const response = await _updateLead(payload);
    if ('error' in response) {
      message = 'text.updateLeadFail';
      status = CONSTANTS.snackBarConfig.type.error;
    }

    dispatch(
      displaySnackBarMessage({
        message,
        status,
      })
    );
    return response;
  };

  return [updateLead as any, _statusObj];
}
export function useUpdateCustomer() {
  const [_updateCustomer, _statusObj] = useUpdateCustomerMutation();
  const dispatch = useDispatch();

  const updateCustomer = async (payload: UpdateCustomerPayload) => {
    let message = 'text.updateCustomerSuccess';
    let status = CONSTANTS.snackBarConfig.type.success;

    if (JSON.stringify(payload?.payload) === '{}') {
      dispatch(
        displaySnackBarMessage({
          message,
          status,
        })
      );
      return;
    }
    const response = await _updateCustomer(payload);

    if ('error' in response) {
      message = 'text.updateCustomerFail';
      status = CONSTANTS.snackBarConfig.type.error;
    }

    dispatch(
      displaySnackBarMessage({
        message,
        status,
      })
    );
    return response;
  };

  return [updateCustomer as any, _statusObj];
}
