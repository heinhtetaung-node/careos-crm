import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import Autocomplete from '../Autocomplete';
import CommonTextField from '../CommonTextField/CommonTextField';

interface SearchBy {
  option: string;
  value: string;
}
interface ComboSearchFieldProps {
  options: SearchBy[];
  value?: { searchBy: string; searchTerm: string };
  searchByLabel?: string;
  searchTermLabel?: string;
  searchByPlaceholder?: string;
  searchTermPlaceholder?: string;
  handleDataUpdate: (payload: { searchBy: string; searchTerm: string }) => void;
}

// to remove unnecessary border radius
const useStyles = makeStyles({
  autocomplete: {
    '& .MuiOutlinedInput-root': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      '&:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
        borderRightWidth: '0.5px',
      },
    },
  },
  textfield: {
    '& .MuiOutlinedInput-root': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      '&:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
        borderLeftWidth: '0.5px',
      },
    },
  },
});

// the first option in the option array will always be default value!
export default function ComboSearchField({
  options,
  value,
  handleDataUpdate,
  searchByLabel = '',
  searchTermLabel = '',
  searchByPlaceholder = getString('text.select'),
  searchTermPlaceholder = `${getString('text.search')}...`,
}: ComboSearchFieldProps) {
  const [searchBy, setSearchBy] = useState<SearchBy>(options[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchBy(
      options.find((option) => option.value === value?.searchBy) || options[0]
    );
    setSearchTerm(value?.searchTerm || '');
  }, [value, options]);

  useEffect(() => {
    handleDataUpdate({
      searchTerm,
      searchBy: searchBy.value,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBy, searchTerm]);

  const classes = useStyles();

  return (
    <Grid container>
      <Grid xs={5} item>
        <Autocomplete
          className={classes.autocomplete}
          value={searchBy}
          onChange={(_, selectedOption) =>
            setSearchBy(selectedOption as SearchBy)
          }
          disableClearable
          textFieldProps={{
            label: searchByLabel,
            placeholder: searchByPlaceholder,
          }}
          options={options}
          optionTextKey="option"
        />
      </Grid>
      <Grid xs={7} item>
        <CommonTextField
          className={classes.textfield}
          value={searchTerm}
          label={searchTermLabel}
          placeholder={searchTermPlaceholder}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
