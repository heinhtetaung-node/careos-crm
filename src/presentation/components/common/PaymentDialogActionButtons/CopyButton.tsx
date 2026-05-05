import { Button } from '@alphafounders/ui';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useCopyToClipboard } from 'usehooks-ts';

import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

interface CopyButtonProps {
  successMessage: string;
  successMessageAlert: string;
}

function CopyButton({
  successMessage,
  successMessageAlert,
}: Readonly<CopyButtonProps>) {
  const dispatch = useDispatch();
  const [_, copy] = useCopyToClipboard();
  const showAlert = (
    snackBarType: string,
    messageText: string,
    isNotClose = false
  ) => {
    dispatch(
      showSnackBar({
        isOpen: true,
        message: messageText,
        status: snackBarType,
        isNotClose,
      })
    );
  };
  const handleCopy = () => {
    copy(successMessage);
    showAlert(CONSTANTS.snackBarConfig.type.success, successMessageAlert);
  };
  return (
    <Button
      className="uppercase bg-primary text-white px-4 h-10 font-sans"
      onClick={handleCopy}
      dataTestId="copy-button"
      text={getString('text.copyMessage')}
    />
  );
}

export default CopyButton;
