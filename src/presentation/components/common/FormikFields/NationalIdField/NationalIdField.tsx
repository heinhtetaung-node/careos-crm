import { InputBaseComponentProps } from '@material-ui/core';
import Cleave from 'cleave.js/react';
import React from 'react';

import DetailViewTextField, {
  DetailViewTextFieldProps,
} from '../DetailViewTextField/DetailViewTextField';

function NationalIdInputMask({ inputRef, ...props }: InputBaseComponentProps) {
  return (
    <Cleave
      {...props}
      htmlRef={inputRef}
      options={{
        blocks: [1, 4, 5, 2, 1],
        numericOnly: true,
      }}
    />
  );
}

export default function NationalIdField(props: DetailViewTextFieldProps) {
  return <DetailViewTextField {...props} input={NationalIdInputMask} />;
}
