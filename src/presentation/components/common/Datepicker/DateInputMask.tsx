import { InputBaseComponentProps } from '@material-ui/core';
import Cleave from 'cleave.js/react';
import * as React from 'react';

function DateInputMask({ inputRef, ...props }: InputBaseComponentProps) {
  return <Cleave {...props} options={props.options} htmlRef={inputRef} />;
}

export default DateInputMask;
