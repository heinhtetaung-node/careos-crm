import { FormControl, MenuItem, TextField } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { useField } from 'formik';
import * as React from 'react';

import { IFormikSelectFieldProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';

import InputContainer from '../InputContainer';

interface SelectElement {
  value: any;
  name?: string | undefined;
  handleUpdate?: (payload: any) => void;
}

function FormikSelectField({
  name = '',
  title,
  dataTestId = '',
  options = [],
  placeholder = '',
  handleUpdate,
}: IFormikSelectFieldProps) {
  const [field, meta, helpers] = useField(name);
  const { setValue } = helpers;
  const { error } = meta;
  const { value } = field;

  const handleChange = (event: React.ChangeEvent<SelectElement>) => {
    if (handleUpdate) {
      const payload = {
        [name]: event.target.value,
      };
      handleUpdate(payload);
    }
  };

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={false}
    >
      <FormControl fullWidth>
        <TextField
          select
          value={value || ''}
          onBlur={handleChange}
          SelectProps={{
            IconComponent: ExpandMoreRoundedIcon,
          }}
          onChange={(event: any) => {
            setValue(event?.target.value);
          }}
          inputProps={{
            'data-testid': `${dataTestId}-select`,
          }}
        >
          {placeholder ? (
            <MenuItem value="" disabled>
              {getString(placeholder)}
            </MenuItem>
          ) : null}

          {options.length
            ? options.map((option: any) => {
                return (
                  <MenuItem key={option.id} value={option.val}>
                    {getString(option.title)}
                  </MenuItem>
                );
              })
            : null}
        </TextField>
      </FormControl>
    </InputContainer>
  );
}

export default FormikSelectField;
