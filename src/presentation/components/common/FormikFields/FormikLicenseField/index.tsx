import { useField } from 'formik';
import * as React from 'react';

import { IFormikLicenseFieldProps } from 'interfaces/FormikFieldsInterface';

import FormikLicenseInput from './FormikLicenseInput';

import {
  Typography,
  LicenseProvince,
  useStyles,
} from '../FormikWrapper/index.styles';
import InputContainer from '../InputContainer';

function FormikLicenseField({
  name,
  title,
  dataTestId,
  isReadOnly = false,
  placeholder,
  province,
  ...rest
}: IFormikLicenseFieldProps) {
  const [field, meta] = useField(name);
  const { error } = meta;
  const { value } = field;
  const classes = useStyles();

  const getProvince = () =>
    province ? (
      <LicenseProvince data-testid={`${dataTestId}-province`}>
        {province}
      </LicenseProvince>
    ) : null;

  const licenseProps = {
    name,
    title,
    province,
    dataTestId,
    placeholder,
    ...rest,
  };
  return (
    <InputContainer
      title={title}
      showAsterisk={!!error}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
    >
      {isReadOnly ? (
        <div className="flex items-start pt-[10px] pr-[10px]">
          <Typography
            data-testid={`${dataTestId}-readonly-text`}
            className={classes.licenseReadOnly}
          >
            {value ?? '-'}
          </Typography>
          {getProvince()}
        </div>
      ) : (
        <FormikLicenseInput {...licenseProps} />
      )}
    </InputContainer>
  );
}

export default FormikLicenseField;
