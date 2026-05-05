import { withStyles } from '@material-ui/core/styles';
import MuiTypography from '@material-ui/core/Typography';
import React from 'react';

import InputContainer from '../FormikFields/InputContainer';

interface RemovableItemProps {
  label: string;
  value: any;
  dataTestId?: string;
  handleRemove: (payload: any) => void;
}

const Typography = withStyles((theme) => ({
  root: {
    padding: 10,
    color: theme.palette.text.primary,
  },
}))(MuiTypography);

function RemovableItem({
  label,
  value,
  dataTestId,
  handleRemove,
}: RemovableItemProps) {
  return (
    <InputContainer
      title={label}
      dataTestId={dataTestId}
      isRemovable
      handleRemove={handleRemove}
    >
      <Typography>{value}</Typography>
    </InputContainer>
  );
}

export default RemovableItem;
