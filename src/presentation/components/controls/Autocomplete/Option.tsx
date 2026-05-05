import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import React, { FC } from 'react';
import styled, { StyledComponent } from 'styled-components';

import { getString } from 'presentation/theme/localization';

import { showQuantity } from './Autocomplete.helpers';

const StyledDiv: StyledComponent<any, any> = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

interface Props {
  label: string;
  multiple?: boolean;
  selected?: boolean;
  checkedIcon?: React.ReactElement;
  marginRight?: number;
  option: any;
  numOptions: number;
  disabled?: boolean;
}

const Option: FC<Props> = ({
  label,
  multiple,
  selected,
  checkedIcon = <CheckBoxIcon fontSize="small" />,
  marginRight,
  option,
  numOptions,
  disabled,
}) => {
  return (
    <StyledDiv>
      <div>
        {multiple && (
          <Checkbox
            disabled={disabled}
            checkedIcon={checkedIcon}
            style={{ marginRight }}
            checked={selected}
            color="primary"
            data-testid="common-my-complete__checkbox"
          />
        )}
        <span
          data-testid={
            option[label] ? 'option-select-item' : 'option-select-item-all'
          }
        >
          {!multiple
            ? option[label]
            : option[label] || getString('text.selectAll')}
        </span>
      </div>

      {showQuantity(option[label], numOptions)}
    </StyledDiv>
  );
};

export default Option;
