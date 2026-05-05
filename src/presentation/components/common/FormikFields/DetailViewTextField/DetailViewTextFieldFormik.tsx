import { useField } from 'formik';
import React from 'react';

import DetailViewTextField, {
  DetailViewTextFieldProps,
} from './DetailViewTextField';

function DetailViewTextFieldFormik({ ...props }: DetailViewTextFieldProps) {
  const [_field, _meta, helpers] = useField(props.name);
  const { setValue } = helpers;

  return <DetailViewTextField {...props} setFormikValue={setValue} />;
}

export default DetailViewTextFieldFormik;
