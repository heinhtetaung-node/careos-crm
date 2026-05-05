import React, { ChangeEventHandler, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import CommonTextField, {
  CommonTextFieldProps,
} from '../CommonTextField/CommonTextField';
import { normalizedText } from '../FormikFields/DetailViewTextField/DetailViewTextField';
import {
  formatLicensePlate,
  normalizedLicensePlate,
} from '../FormikFields/LicensePlate/LicensePlate';

export interface CommonLicensePlateProps
  extends Omit<CommonTextFieldProps, 'label'> {
  handleOnChange?: (payload: any) => void;
}

export default function CommonLicensePlate({
  value,
  name = 'licensePlate',
  handleDataUpdate,
  handleOnChange = () => null,
  ...otherProps
}: CommonLicensePlateProps) {
  const [licensePlate, setLicensePlate] = useState(() =>
    normalizedLicensePlate(value as string)
  );
  const [lastLicensePlateValue, setLastLicensePlateValue] = useState(() =>
    normalizedLicensePlate(value as string)
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const {
      target: { value: inputValue },
    } = event;
    if (
      inputValue.length === 2 &&
      Number.isInteger(+inputValue) &&
      !licensePlate.includes(' ')
    ) {
      setLicensePlate(`${inputValue} `);
      return;
    }
    if (
      !inputValue.includes(' ') &&
      inputValue.length > 1 &&
      Number.isInteger(+inputValue[inputValue.length - 1]) &&
      !licensePlate.includes(' ')
    ) {
      const result = formatLicensePlate(inputValue);
      setLicensePlate(result);
      return;
    }

    setLicensePlate(inputValue);
    // call handleOnChange for controlled component.
    if (handleOnChange) handleOnChange(inputValue);
  };

  const handleSubmit = (val: any) => {
    if (licensePlate !== lastLicensePlateValue && handleDataUpdate) {
      const payload = normalizedText(val);
      handleDataUpdate({ [name]: payload });
      setLastLicensePlateValue(val);
    }
  };

  return (
    <CommonTextField
      label={getString('qc.licensePlate')}
      name={name}
      value={licensePlate}
      fullWidth
      onChange={handleChange}
      handleDataUpdate={handleSubmit}
      {...otherProps}
    />
  );
}
