/* eslint-disable react-hooks/exhaustive-deps */
import { PenOutlineIcon } from '@alphafounders/icons';
import { Grid } from '@material-ui/core';
import { useField, useFormikContext } from 'formik';
import * as React from 'react';

import { IFormikTextFieldProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import { countingAgeToPresent } from 'shared/helper/utilities';
import { format, add } from 'utils/datetime';

import FormikInputDateMask from './FormikInputDateMask';

import {
  TextField,
  Typography,
  IconButton,
  useStyles,
} from '../FormikWrapper/index.styles';
import InputContainer from '../InputContainer';

const dateOptions = {
  date: true,
  delimiter: '/',
  datePattern: ['d', 'm', 'Y'],
};

const localStorageService = new LocalStorage();
const isThai =
  localStorageService.getItemByKey(LOCALSTORAGE_KEY.LOCALE) === 'th';

function FormikDateField({
  name = '',
  title,
  dataTestId = '',
  isReadOnly = false,
  placeholder,
  ...rest
}: IFormikTextFieldProps) {
  const classes = useStyles();
  const [formattedDate, setFormattedDate] = React.useState('');
  const { setFieldValue } = useFormikContext();
  const [field, meta, helpers] = useField(name);
  const { setValue } = helpers;
  const { error } = meta;
  const { value } = field;

  const handleFocus = () => {
    const input = document.getElementById(`${name}-input`);
    if (input) {
      input.focus();
    }
  };

  const updateAge = () => {
    setFieldValue(
      'age',
      countingAgeToPresent(format(new Date(value), 'MM/dd/yyyy'))
    );
  };

  const setDateValue = () => {
    if (isThai) {
      const newDate = format(
        add(new Date(value), { years: 543 }),
        'dd/MM/yyyy'
      );
      setFormattedDate(newDate);
    } else {
      setFormattedDate(value);
    }
  };

  React.useEffect(() => {
    if (value) {
      setDateValue();
    }
  }, []);

  React.useEffect(() => {
    if (value) {
      // if value was initially undefined
      if (!formattedDate) {
        setDateValue();
      }
      // Update dependent age field
      if (name === 'dateOfBirth') {
        updateAge();
      }
    }
  }, [value]);

  return (
    <InputContainer
      title={title}
      showAsterisk={!!error}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
    >
      {isReadOnly ? (
        <Typography className={classes.panelReadOnlyContent}>
          {formattedDate}
        </Typography>
      ) : (
        <Grid item container>
          <Grid item xs={10}>
            <Grid item container wrap="nowrap" xs={12}>
              <TextField
                fullWidth
                {...rest}
                error={Boolean(error)}
                value={value || ''}
                placeholder={placeholder ? getString(placeholder) : ''}
                InputProps={{
                  inputComponent: FormikInputDateMask as any,
                  disableUnderline: true,
                  inputProps: {
                    options: dateOptions,
                    setValue,
                    value: formattedDate,
                    isThai,
                    inputId: `${name}-input`,
                    'data-testid': `${dataTestId}-datefield`,
                  },
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={handleFocus}>
              <PenOutlineIcon fontSize="small" data-testid="pen-icon" />
            </IconButton>
          </Grid>
        </Grid>
      )}
    </InputContainer>
  );
}

export default FormikDateField;
