import { withStyles, alpha } from '@material-ui/core/styles';
import MuiTextField from '@material-ui/core/TextField';
import { useFormik } from 'formik';
import _isEmpty from 'lodash/isEmpty';
import React, { useState, useEffect } from 'react';

import InputContainer from 'presentation/components/common/FormikFields/InputContainer';

import {
  formatLicensePlateString,
  validationSchema,
  getLicensePlatePayload,
} from './helper';

import { CustomDetailViewTextFieldProps } from '../interface';
import clsx from 'clsx';

const TextField = withStyles((theme) => ({
  root: {
    width: 'auto !important',
    height: '100%',
    padding: '0 !important',
    margin: '0 !important',
    '& .MuiInput-formControl': {
      height: '100%',
    },
    '& .MuiInputBase-input': {
      boxSizing: 'border-box',
      height: '100%',
      padding: 5,
      lineHeight: '20px',
      caretColor: theme.palette.warning.main,
      '&::placeholder': {
        color: theme.palette.text.secondary,
      },
    },
    '& .Mui-focused': {
      background: `linear-gradient(0deg, ${alpha(
        theme.palette.grey[100],
        0.25
      )}, ${alpha(theme.palette.grey[100], 0.25)}), ${
        theme.palette.common.white
      }`,
      '& .textfield-input': {
        borderBottom: `1px solid ${theme.palette.primary.main}`,
      },
    },
  },
}))(MuiTextField);

export default function LicensePlate({
  abbreviation,
  name,
  title,
  dataTestId,
  value,
  error,
  isReadOnly = false,
  input = 'input',
  handleUpdate,
  backgroundColor,
  isDisabled = false,
  showAsterisk = false,
  hideLabel = false,
}: Readonly<CustomDetailViewTextFieldProps>) {
  const inputFreeTextRef = React.useRef<HTMLInputElement>(null);
  const inputNumericalTextRef = React.useRef<HTMLInputElement>(null);
  const [licensePlate, setLicensePlate] = useState({
    freeText: '',
    numericalText: '',
  });

  useEffect(() => {
    if (value?.carLicensePlate) {
      const formattedLicensePlate = formatLicensePlateString(
        value.carLicensePlate,
        abbreviation || ''
      );

      if (formattedLicensePlate) {
        setLicensePlate({
          freeText: formattedLicensePlate.freeText,
          numericalText: formattedLicensePlate.numericalText,
        });
      }
    } else {
      setLicensePlate({
        freeText: '',
        numericalText: '',
      });
    }
  }, [abbreviation, value]);

  const onSubmit = (response: any) => {
    if (handleUpdate) {
      handleUpdate(response);
    }
  };

  const initialFormValue = {
    freeText: licensePlate.freeText,
    numericalText: licensePlate.numericalText,
    redPlate: value.redPlate,
  };

  const formik = useFormik({
    initialValues: initialFormValue,
    enableReinitialize: true,
    validationSchema,
    onSubmit,
    validateOnMount: true,
  });

  const handleSave = () => {
    if (
      licensePlate &&
      handleUpdate &&
      _isEmpty(formik.errors) &&
      abbreviation
    ) {
      const licensePlatePayload = getLicensePlatePayload(
        formik.values,
        abbreviation
      );
      if (
        licensePlatePayload &&
        licensePlatePayload !== value.carLicensePlate
      ) {
        handleUpdate({
          [name]: licensePlatePayload,
        });
      }
    }
  };

  const handleChange = (event: any, field: 'freeText' | 'numericalText') => {
    formik.setFieldTouched(field);
    formik.setFieldValue(field, event.target.value);
    setLicensePlate({
      ...licensePlate,
      [field]: event.target.value,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      inputFreeTextRef?.current?.blur();
      inputNumericalTextRef?.current?.blur();
    }
  };

  return (
    <InputContainer
      showLabel={!hideLabel}
      title={title}
      error={formik?.errors?.freeText || formik?.errors?.numericalText || error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
      isDisabled={isDisabled}
      showAsterisk={showAsterisk}
    >
      <div
        className={clsx(
          'flex items-center justify-start h-[100%]',
          backgroundColor && 'mb-1'
        )}
      >
        <TextField
          disabled={isReadOnly || isDisabled}
          name={name}
          value={licensePlate.freeText}
          inputRef={inputFreeTextRef}
          onChange={(e) => handleChange(e, 'freeText')}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          InputProps={{
            inputComponent: input,
            disableUnderline: true,
            inputProps: {
              'data-testid': `${dataTestId}-freeText-input`,
              className: clsx([
                'textfield-input w-[40px]',
                backgroundColor &&
                  `-ml-1 bg-${backgroundColor} p-2 border-[1px] border-solid rounded-[9px] border-[#e9edf5] focus:border-[1px] focus:border-[#005098] hover:border-[#005098] outline-none transition-all`,
              ]),
              placeholder: '9กก',
              maxLength: 3,
            },
          }}
        />
        -
        <TextField
          disabled={isReadOnly || isDisabled}
          name={name}
          value={licensePlate.numericalText}
          inputRef={inputNumericalTextRef}
          onChange={(e) => handleChange(e, 'numericalText')}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          InputProps={{
            inputComponent: input,
            disableUnderline: true,
            inputProps: {
              'data-testid': `${dataTestId}-numericalText-input`,
              className: clsx([
                'textfield-input w-[44px]',
                backgroundColor &&
                  `mr-0.5 bg-${backgroundColor} p-2 border-[1px] border-solid rounded-[9px] border-[#e9edf5] focus:border-[1px] focus:border-[#005098] hover:border-[#005098] outline-none transition-all`,
              ]),
              placeholder: '1234',
              maxLength: 4,
            },
          }}
        />
        <span className="bg-primary-light px-2 py-1 rounded">
          {abbreviation}
        </span>
      </div>
    </InputContainer>
  );
}
