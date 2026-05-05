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

import { Typography } from 'presentation/components/common/FormikFields/FormikWrapper/index.styles';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import { getString } from 'presentation/theme/localization';

import { RadioProps } from '../interface';

interface OptionProps {
  id: string;
  val: string | number | boolean;
  title: string;
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

function renderControl(disable?: boolean) {
  return (
    <Radio
      checkedIcon={
        <CheckCircleRoundedIcon
          fontSize="small"
          color={disable ? 'inherit' : 'primary'}
        />
      }
      size="small"
    />
  );
}

function getRadioOptions(options: OptionProps[], isDisabled: boolean) {
  if (options.length) {
    return options.map((option: any) => (
      <FormControlLabel
        key={option.id}
        value={option.val}
        control={renderControl(isDisabled)}
        disabled={isDisabled}
        label={<Typography>{getString(option.title)}</Typography>}
      />
    ));
  }

  return null;
}

function RadioGroupComponent({
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
}: RadioProps) {
  const classes = useStyles();

  const selectedValue = value !== undefined ? value : null;

  return (
    <InputContainer
      title={title}
      error={error}
      showLabel={showLabel}
      isReadOnly={isReadOnly}
      isDisabled={isDisabled}
      showAsterisk={showAsterisk}
    >
      <Grid item container data-testid={dataTestId}>
        <Grid item xs={12}>
          {isReadOnly ? (
            <Typography className={classes.root}>{value}</Typography>
          ) : (
            <FormControl fullWidth>
              <RadioGroup
                name={name}
                value={selectedValue}
                onChange={handleChange}
                row={row}
                data-testid={`${dataTestId}-radiogroup`}
              >
                {getRadioOptions(options, isDisabled)}
              </RadioGroup>
            </FormControl>
          )}
        </Grid>
      </Grid>
    </InputContainer>
  );
}

export default RadioGroupComponent;
