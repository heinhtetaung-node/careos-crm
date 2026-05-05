import FormControlLabel, {
  FormControlLabelProps,
} from '@material-ui/core/FormControlLabel';
import Radio, { RadioProps } from '@material-ui/core/Radio';
import React from 'react';
import styled from 'styled-components';

const Label = styled(FormControlLabel)`
  .checked,
  .checked + .label {
    background: red !important;
  }

  .MuiIconButton-root {
    display: none;
  }
`;

function ButtonRadio({ label, value, Control = Radio, ...rest }: any) {
  return (
    <Label
      className="multiselect-form-label"
      value={value}
      control={<Control {...rest} />}
      label={label}
    />
  );
}

ButtonRadio.defaultProps = {
  control: <Radio />,
};

export default ButtonRadio;
