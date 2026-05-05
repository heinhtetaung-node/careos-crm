import { InputBaseComponentProps } from '@material-ui/core';
import Cleave from 'cleave.js/react';
import * as React from 'react';

import { InputMaskProps } from 'presentation/components/common/FormikFields/FormikInputMask';
import { format, add } from 'utils/datetime';

function FormikInputDateMask({
  onBlur,
  setValue,
  inputId,
  inputRef,
  isThai,
  ...options
}: InputBaseComponentProps & InputMaskProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isThai) {
      setValue(
        format(add(new Date(event.target.value), { years: 543 }), 'dd/MM/yyyy')
      );
    } else {
      setValue(event.target.value);
    }
  };

  return (
    <Cleave
      {...options}
      id={inputId}
      onChange={handleChange}
      onBlur={onBlur}
      ref={inputRef}
    />
  );
}

export default FormikInputDateMask;
