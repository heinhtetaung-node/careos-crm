import clsx from 'clsx';
import { useField } from 'formik';
import * as React from 'react';

import { IFormikFieldProps } from 'interfaces/FormikFieldsInterface';

import { Typography, useStyles } from '../FormikWrapper/index.styles';
import InputContainer from '../InputContainer';

function FormikTextContent({
  name = '',
  dataTestId = '',
  isReadOnly,
}: IFormikFieldProps) {
  const classes = useStyles();
  const [field] = useField(name);
  const { value } = field;

  return (
    <InputContainer
      title={name}
      showLabel={false}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
    >
      <Typography
        className={clsx(classes.panelTextContent)}
        data-testid={`${dataTestId}-textcontent`}
      >
        {value || '-'}
      </Typography>
    </InputContainer>
  );
}

export default FormikTextContent;
