import { withStyles } from '@material-ui/core/styles';
import MuiTypography from '@material-ui/core/Typography';
import React from 'react';

import Checkbox from 'presentation/components/common/controls/Checkbox';

import InputContainer from '../InputContainer';

interface DetailViewCheckboxProps {
  name: string;
  title: string;
  checked?: boolean;
  dataTestId?: string;
  error?: string;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  handleUpdate: (payload: any) => void;
}

const Typography = withStyles((theme) => ({
  root: {
    padding: 10,
    color: theme.palette.grey[800],
  },
}))(MuiTypography);

function DetailViewCheckbox({
  name,
  title,
  checked = false,
  dataTestId,
  error,
  isReadOnly = false,
  isDisabled = false,
  handleUpdate,
}: DetailViewCheckboxProps) {
  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
    >
      {isReadOnly ? (
        <Typography>{name}</Typography>
      ) : (
        <Checkbox
          name={name}
          checked={checked}
          indeterminate={false}
          isDisabled={isDisabled}
          handleUpdate={handleUpdate}
        />
      )}
    </InputContainer>
  );
}

export default DetailViewCheckbox;
