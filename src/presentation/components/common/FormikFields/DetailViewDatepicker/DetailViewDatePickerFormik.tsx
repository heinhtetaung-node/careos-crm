import { useFormikContext } from 'formik';
import React from 'react';

import DetailViewDatePicker, {
  DetailViewDatepickerProps,
} from './DetailViewDatepicker';

type DetailViewDatePickerFormikProps = Omit<
  DetailViewDatepickerProps,
  'setFormikValue'
>;

export default function DetailViewDatePickerFormik(
  props: DetailViewDatePickerFormikProps
) {
  const { setFieldValue, setFieldError, submitForm } = useFormikContext();

  return (
    <DetailViewDatePicker
      {...props}
      setFormikValue={setFieldValue}
      setFormikError={setFieldError}
      formikSubmit={submitForm}
    />
  );
}
