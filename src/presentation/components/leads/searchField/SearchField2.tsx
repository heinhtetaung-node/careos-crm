import { Grid, Typography } from '@material-ui/core';
import React from 'react';

import Controls from 'presentation/components/controls/Control';

import { getString } from '../../../theme/localization';

import './SearchField.scss';

interface ISearchData {
  key: string;
  value: string;
}

interface SearchFieldProps {
  error?: any;
  label?: string;
  value: ISearchData;
  fixedLabel?: boolean;
  searchOption: Array<any>;
  inputPlaceholder?: string;
  onChange: (field: string, value: any, action?: string) => void;
}

const DEFAULT_INPUT_PLACEHOLDER = 'text.search';
const DEFAULT_SELECT_LABEL = 'text.search';

function SearchField({
  value,
  error,
  onChange,
  searchOption,
  fixedLabel = false,
  label = DEFAULT_SELECT_LABEL,
  inputPlaceholder = DEFAULT_INPUT_PLACEHOLDER,
}: SearchFieldProps) {
  const handleSelectChange = (e: React.ChangeEvent<any>) => {
    const { value: selectValue } = e.target;
    if (selectValue) {
      onChange('search', { ...value, key: selectValue });
    } else {
      onChange('search', { ...value, key: selectValue }, 'clear');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    onChange('search', { ...value, value: inputValue });
  };

  return (
    <Grid
      container
      item
      xs={12}
      className="search-field"
      data-testid="search-field-main-container"
    >
      <Grid item lg={6} className="display-flex-md">
        <Controls.Select
          className="search-field__select"
          name="selectValue"
          label={label}
          value={value.key}
          onChange={handleSelectChange}
          options={searchOption}
          selectField="value"
          fixedLabel
        />
      </Grid>
      <Grid item lg={6} className="display-flex-md">
        <Controls.Input
          className={`search-field__input ${
            error?.value ? 'search-field__input--error' : ''
          }`}
          name="inputValue"
          value={value.value}
          fixedLabel={fixedLabel}
          onBlur={handleInputChange}
          onChange={handleInputChange}
          placeholder={getString(inputPlaceholder)}
        />
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={6}>
          <Typography variant="caption" color="error">
            {error?.key || ''}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="error">
            {error?.value || ''}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default SearchField;
