import {
  Button,
  FormControl,
  InputLabel,
  Grid,
  OutlinedInput,
  makeStyles,
  createStyles,
  CircularProgress,
} from '@material-ui/core';
import React, { useState } from 'react';

import { useTransformPlaceholderMutation } from 'data/slices/leadDetailSlices/transformPlaceholderSlice';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import { getLeadIdFromPath } from 'shared/helper/utilities';

import {
  getFilterValues,
  getTransformedMessage,
  isValidPackageUrl,
} from './email.helper';
import './index.scss';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';

const localStorage = new LocalStorage();

const useStyles = makeStyles(() =>
  createStyles({
    adornmentEnd: {
      paddingRight: 0,
      alignItems: 'stretch',
    },
    errorText: {
      textAlign: 'center',
      color: 'red',
    },
  })
);

interface AddQuoteURLProps {
  setEmailMessage: (arg?: string) => void;
  message: string;
}

export default function AddQuoteURL({
  message,
  setEmailMessage,
}: AddQuoteURLProps) {
  const classes = useStyles();
  const [packageUrl, setPackageUrl] = useState('');
  const [transformPlaceholder, { isLoading, isError }] =
    useTransformPlaceholderMutation();

  const dispatch = useAppDispatch();

  const handleClick = async () => {
    const locale = localStorage.getItemByKey(LOCALSTORAGE_KEY.LOCALE);
    const newMessage = getTransformedMessage(message, packageUrl);
    const filter = getFilterValues(packageUrl);
    const lead = getLeadIdFromPath();
    const payload: any = {
      body: newMessage,
      locale,
      filter,
    };
    const response = await transformPlaceholder({
      leadId: lead,
      payload,
    });
    if ('data' in response) {
      setEmailMessage(response.data?.text);
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.emailMessageUpdatedSuccess'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    } else {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: (response.error as any)?.data?.message || '',
          status: CONSTANTS.snackBarConfig.type.error,
          isNotClose: true,
        })
      );
    }
  };

  return (
    <Grid item xs={12} md={12}>
      <FormControl variant="outlined">
        <InputLabel htmlFor="package-url">
          {getString('text.quotesAndPackageURL')}
        </InputLabel>
        <OutlinedInput
          name="packageUrl"
          placeholder={getString('text.quotesAndPackageURL')}
          value={packageUrl}
          onChange={(event) => setPackageUrl(event.target.value)}
          id="package-url"
          type="text"
          className={classes.adornmentEnd}
          endAdornment={
            <Button
              onClick={handleClick}
              variant="contained"
              color="primary"
              disabled={!isValidPackageUrl(packageUrl) || isLoading}
            >
              {isLoading ? (
                <CircularProgress data-testid="spinner" size="20px" />
              ) : (
                getString('text.add')
              )}
            </Button>
          }
          labelWidth={70}
          error={isError}
        />
        {isError && (
          <p className={classes.errorText}>
            {getString('errorMessage.generalErrorMessage')}
          </p>
        )}
      </FormControl>
    </Grid>
  );
}
