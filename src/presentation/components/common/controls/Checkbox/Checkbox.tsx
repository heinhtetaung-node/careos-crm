import MuiCheckbox from '@material-ui/core/Checkbox';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles, alpha } from '@material-ui/core/styles';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import React, { useEffect, useState } from 'react';

interface CustomCheckboxProps {
  name: string;
  checked?: boolean;
  handleUpdate: (payload: any) => void;
  indeterminate?: boolean;
  isDisabled?: boolean;
  dataTestId?: string;
}

const Checkbox = withStyles((theme) => ({
  root: {
    padding: 10,
    color: theme.palette.grey[200],
    '&:hover': {
      backgroundColor: `${alpha('#2196f3', 0.04)} !important`,
    },
    '&.Mui-disabled': {
      color: theme.palette.grey[200],
      '&:hover': {
        backgroundColor: 'unset !important',
      },
    },
  },
}))(MuiCheckbox);

const FormControlLabel = withStyles((theme) => ({
  root: {
    margin: 0,
  },
  label: {
    color: theme.palette.text.primary,
    '&.Mui-disabled': {
      color: theme.palette.grey[400],
    },
  },
}))(MuiFormControlLabel);

function CustomCheckbox({
  name,
  checked = false,
  handleUpdate,
  indeterminate = false,
  isDisabled = false,
  dataTestId,
}: CustomCheckboxProps) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
    if (handleUpdate) {
      handleUpdate(event.target.checked);
    }
  };
  const renderCheckbox = () => (
    <Checkbox
      color="primary"
      name={name}
      onChange={handleChange}
      disabled={isDisabled}
      checked={isChecked}
      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
      indeterminateIcon={
        isChecked ? (
          <IndeterminateCheckBoxIcon fontSize="small" />
        ) : (
          <CheckBoxOutlineBlankIcon fontSize="small" />
        )
      }
      checkedIcon={<CheckBoxIcon fontSize="small" />}
      indeterminate={indeterminate ?? undefined}
      data-testid={dataTestId}
    />
  );

  return (
    <FormControlLabel
      control={renderCheckbox()}
      label={name}
      disabled={isDisabled}
    />
  );
}

export default CustomCheckbox;
