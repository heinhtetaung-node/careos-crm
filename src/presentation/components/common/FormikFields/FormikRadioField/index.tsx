import {
  Grid,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  FormControl,
  Radio as MuiRadio,
} from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import React from 'react';

import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';

import { Typography } from '../FormikWrapper/index.styles';
import InputContainer from '../InputContainer';

export interface RadioGroupFieldProps extends IFormikControllerProps {
  options?: any;
  row?: boolean;
  handleChange?: (
    payload: React.ChangeEvent<HTMLInputElement>
  ) => void | undefined;
  showAsterisk?: boolean;
}

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
});

const RadioGroup = withStyles(() => ({
  root: {
    padding: 10,
    gap: '10px',
    '& .MuiFormControlLabel-root': {
      margin: 0,
      flex: 1,
      '& .MuiTypography-root': {
        lineHeight: '20px',
      },
      '& .MuiRadio-root': {
        padding: 5,
      },
    },
  },
  row: {
    padding: 0,
    '& .MuiFormControlLabel-root': {
      margin: 0,
      '& .MuiRadio-root': {
        padding: 10,
      },
    },
  },
}))(MuiRadioGroup);

const Radio = withStyles((theme) => ({
  root: {
    margin: '0 10px 0 0',
    color: theme.palette.grey[200],
  },
}))(MuiRadio);

function FormikRadioField({
  name,
  title,
  dataTestId = '',
  options = [],
  row = false,
  showLabel,
  isReadOnly = false,
  error,
  value,
  handleChange,
  isDisabled = false,
  showAsterisk = false,
}: RadioGroupFieldProps) {
  const classes = useStyles();

  const renderControl = () => (
    <Radio
      checkedIcon={
        <CheckCircleRoundedIcon
          fontSize="small"
          color={isDisabled ? 'inherit' : 'primary'}
        />
      }
      size="small"
    />
  );
  return (
    <InputContainer
      title={title}
      error={error}
      showLabel={showLabel}
      isReadOnly={isReadOnly}
      isDisabled={!isReadOnly && isDisabled}
      showAsterisk={showAsterisk}
    >
      <Grid item container data-testid={dataTestId}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <RadioGroup
              name={name}
              value={value}
              onChange={handleChange}
              row={row}
              data-testid={`${dataTestId}-radiogroup`}
            >
              {options.length
                ? options.map((option: any) => (
                    <FormControlLabel
                      key={option.id}
                      value={option.val}
                      control={renderControl()}
                      disabled={isReadOnly || isDisabled}
                      data-testid={`option-${option.title}`}
                      label={<Typography>{getString(option.title)}</Typography>}
                    />
                  ))
                : null}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </InputContainer>
  );
}

export default FormikRadioField;
