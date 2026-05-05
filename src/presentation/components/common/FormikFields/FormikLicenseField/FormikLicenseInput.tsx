/* eslint-disable react-hooks/exhaustive-deps */
import { PenOutlineIcon } from '@alphafounders/icons';
import { Grid, TextField } from '@material-ui/core';
import { useField } from 'formik';
import * as React from 'react';

import { IFormikLicenseFieldProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';

import {
  IconButton,
  LicenseProvince,
  useStyles,
} from '../FormikWrapper/index.styles';

function FormikLicenseInput({
  name,
  dataTestId,
  placeholder,
  province,
}: IFormikLicenseFieldProps) {
  const [field, _, helpers] = useField(name);
  const { setValue } = helpers;
  const { value } = field;
  const [firstPart, setFirstPart] = React.useState('');
  const [lastPart, setLastPart] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const classes = useStyles();

  React.useEffect(() => {
    if (value) {
      const license = value.split(' ')[0];
      setFirstPart(license.split('-')[0]);
      setLastPart(license.split('-')[1]);
    }
  }, [value]);

  React.useEffect(() => {
    if ((firstPart || lastPart) && `${firstPart}-${lastPart}` !== value) {
      setValue(`${firstPart}-${lastPart} ${province ?? ''}`);
    }
  }, [firstPart, lastPart]);

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Grid
      item
      container
      xs={12}
      className="flex items-center pt-[6px] pr-[10px]"
    >
      <Grid item container xs={10}>
        <Grid
          item
          container
          alignItems="center"
          wrap="nowrap"
          xs={12}
          className={classes.licenseContent}
        >
          <Grid item xs={3}>
            <TextField
              placeholder={placeholder ? getString(placeholder) : ''}
              value={firstPart || ''}
              name={name}
              inputRef={inputRef}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setFirstPart(event.target.value)
              }
              FormHelperTextProps={{
                className: classes.helperText,
              }}
              InputProps={{
                disableUnderline: true,
                inputProps: {
                  'data-testid': `${dataTestId}-first-input`,
                },
              }}
            />
          </Grid>
          <Grid item xs={1}>
            -
          </Grid>
          <Grid item xs={4}>
            <TextField
              placeholder={placeholder ? getString(placeholder) : ''}
              value={lastPart || ''}
              name={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLastPart(event.target.value)
              }
              InputProps={{
                disableUnderline: true,
                inputProps: {
                  'data-testid': `${dataTestId}-last-input`,
                },
              }}
            />
          </Grid>
          <Grid item>
            {province ? (
              <LicenseProvince data-testid={`${dataTestId}-province`}>
                {province}
              </LicenseProvince>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={2} justifyContent="center">
        <IconButton onClick={handleFocus}>
          <PenOutlineIcon fontSize="small" data-testid="pen-icon" />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default FormikLicenseInput;
