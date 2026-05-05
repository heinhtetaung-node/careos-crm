import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import * as CONSTANTS from 'shared/constants';

export default function useSnackbar() {
  const dispatch = useAppDispatch();
  const showSuccessSnackbar = (message: string) => {
    dispatch(
      showSnackBar({
        isOpen: true,
        message,
        status: CONSTANTS.snackBarConfig.type.success,
      })
    );
  };

  const showErrorSnackbar = (error: string) => {
    dispatch(
      showSnackBar({
        isOpen: true,
        message: error,
        status: CONSTANTS.snackBarConfig.type.error,
      })
    );
  };

  return {
    showSuccessSnackbar,
    showErrorSnackbar,
  };
}
