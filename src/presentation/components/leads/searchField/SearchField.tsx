import { Grid, Typography } from '@material-ui/core';
import React, { useMemo, useState } from 'react';

import Controls from 'presentation/components/controls/Control';

import './SearchField.scss';
import { getString } from '../../../theme/localization';

interface ISearchData {
  selectValue: string;
  inputValue: string;
}
interface Props {
  value: ISearchData;
  searchOption: Array<any>;
  onChange: (event: any) => void;
  onError?: (event: any) => void;
  fixedLabel?: boolean;
  placeholder?: string;
  inputPlaceholder?: string;
  label?: string;
  name?: string;
  error?: any;
  errorMessage?: string;
}

const DEFAULT_INPUT_PLACEHOLDER = 'text.search';
const DEFAULT_SELECT_PLACEHOLDER = '';
const DEFAULT_SELECT_LABEL = 'text.search';

const SearchField: React.FC<Props> = ({
  value,
  error,
  onError,
  onChange,
  searchOption,
  fixedLabel = false,
  placeholder = DEFAULT_SELECT_PLACEHOLDER,
  inputPlaceholder = DEFAULT_INPUT_PLACEHOLDER,
  label = DEFAULT_SELECT_LABEL,
  name = DEFAULT_SELECT_LABEL,
  errorMessage = '',
}) => {
  const [data, setData] = useState<ISearchData>({
    selectValue: '',
    inputValue: '',
  });

  const handleSelectChange = (e: React.ChangeEvent<any>) => {
    const { value: selectValue } = e.target;

    onChange({
      target: {
        name,
        value: {
          selectValue,
          inputValue: data.inputValue,
          [selectValue]: data.inputValue,
        },
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;
    onChange({
      target: {
        name,
        value: {
          inputValue,
          selectValue: data.selectValue,
          [data.selectValue]: inputValue,
        },
      },
    });
  };

  useMemo(() => {
    const newData = value?.inputValue
      ? { ...data }
      : { selectValue: '', inputValue: '' };

    setData({
      ...newData,
      ...value,
    });
  }, [value]);

  return (
    <Grid
      container
      item
      sm={12}
      md={12}
      lg={12}
      xl={12}
      className="search-field"
    >
      <Grid item lg={6} className="display-flex-md">
        <Controls.Select
          className="search-field__select"
          name="selectValue"
          label={label}
          value={data.selectValue}
          onChange={handleSelectChange}
          options={searchOption}
          selectField="value"
          placeholder={placeholder}
          fixedLabel
        />
      </Grid>
      <Grid item lg={6} className="display-flex-md">
        <Controls.Input
          className="search-field__input"
          name="inputValue"
          value={data.inputValue}
          onChange={handleInputChange}
          fixedLabel={fixedLabel}
          placeholder={getString(inputPlaceholder)}
          disabled={!data.selectValue}
        />
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={6}>
          <Typography variant="caption" color="error">
            {/* {error.key || 'asd'} */}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="error">
            {/* {error.value || ''} */}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SearchField;
