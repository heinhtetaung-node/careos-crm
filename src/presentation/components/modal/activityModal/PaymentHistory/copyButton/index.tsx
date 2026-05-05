import { CopyIcon } from '@alphafounders/icons';
import React from 'react';
import { useDispatch } from 'react-redux';

import { showSnackBar } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';

interface CopyProps {
  copyText: string;
  messageText: string;
}

function Copy({ copyText, messageText }: CopyProps) {
  const dispatch = useDispatch();

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);

    dispatch(
      showSnackBar({
        isOpen: true,
        message: messageText,
        status: CONSTANTS.snackBarConfig.type.success,
        isNotClose: false,
      })
    );
  };

  return (
    <div
      className="flex items-center justify-center cursor-pointer"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      aria-hidden="true"
      data-testid="copy-button"
    >
      <CopyIcon fillColor="#005098" />
    </div>
  );
}

export default Copy;
