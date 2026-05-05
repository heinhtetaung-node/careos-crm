import { withStyles } from '@material-ui/core/styles';
import MuiTypography from '@material-ui/core/Typography';
import React from 'react';

import Autocomplete, {
  IAutocompletePropsOverrided,
} from 'presentation/components/common/Autocomplete';

import InputContainer from '../InputContainer';

interface DetailViewAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends IAutocompletePropsOverrided<T, Multiple, DisableClearable, FreeSolo> {
  name: string;
  title: string;
  value?: any;
  dataTestId?: string;
  error?: string;
  isReadOnly?: boolean;
  handleUpdate: (payload: any) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const Typography = withStyles((theme) => ({
  root: {
    padding: 10,
    color: theme.palette.text.primary,
  },
}))(MuiTypography);

function DetailViewAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  name,
  value,
  title,
  dataTestId = '',
  error,
  isReadOnly = false,
  handleUpdate,
  multiple = false,
  placeholder = '',
  isDisabled = false,
  ...rest
}: DetailViewAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  const handleUpdateSelect = (_event: object, selections: any | any[]) => {
    handleUpdate({ name, selections });
  };

  const formatReadOnlyContent = () => (multiple ? value.join(', ') : value);

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
    >
      {isReadOnly ? (
        <Typography data-testid={`${dataTestId}-readonly`}>
          {formatReadOnlyContent()}
        </Typography>
      ) : (
        <Autocomplete
          textFieldProps={{ variant: 'filled', placeholder }}
          disabled={isDisabled}
          defaultValue={value}
          onChange={handleUpdateSelect}
          multiple={multiple as Multiple}
          {...rest}
        />
      )}
    </InputContainer>
  );
}

export default DetailViewAutocomplete;
