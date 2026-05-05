import { CircularProgress } from '@material-ui/core';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import React, { useEffect } from 'react';
import { getI18n } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useGetCovernoteMutation } from 'data/slices/orderPolicySlice';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

export default function CovernoteDownload({
  policyId,
  btnSize = 'medium',
  shortText = false,
}: {
  policyId: string;
  btnSize?: 'small' | 'medium' | 'large';
  shortText?: boolean;
}) {
  const [getCovernote, { data, isSuccess, isLoading, isError }] =
    useGetCovernoteMutation();
  const language = getI18n()?.language || 'en';
  const dispatch = useDispatch();

  const downloadCoverNote = () => {
    // 'EN' : 'TH'
    getCovernote({
      policyId,
      payload: {
        lang: language.toUpperCase(),
      },
    });
  };

  useEffect(() => {
    if (isSuccess && data) {
      downloadFileFromBlobURL(data.documentName);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (isError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errorMessage.generalErrorMessage'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  return (
    <CommonButton
      data-testid="covernote-button"
      color="default"
      variant="outlined"
      onClick={downloadCoverNote}
      disabled={isLoading}
      size={btnSize}
    >
      {isLoading ? (
        <CircularProgress color="inherit" size={12} className="mr-3" />
      ) : (
        <GetAppRoundedIcon />
      )}
      {getString(shortText ? 'text.download' : 'order.policies.covernote')}
    </CommonButton>
  );
}
