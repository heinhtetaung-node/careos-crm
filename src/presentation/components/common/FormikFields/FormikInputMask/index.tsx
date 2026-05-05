import { InputBaseComponentProps } from '@material-ui/core';
import Cleave from 'cleave.js/react';
import * as React from 'react';

export interface InputMaskProps {
  id?: string;
  name?: string;
  options: any;
  inputId?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
  onBlur: (event: React.ChangeEvent) => void;
  setValue: (payload: string) => void;
}

function FormikInputMask({
  name = '',
  onBlur,
  setValue,
  inputId,
  inputRef = null,
  ...options
}: InputBaseComponentProps & InputMaskProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Cleave {...options} id={inputId} onChange={handleChange} onBlur={onBlur} />
  );
}

export default FormikInputMask;
