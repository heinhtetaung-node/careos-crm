import { withStyles } from '@material-ui/core/styles';
import MuiTypography from '@material-ui/core/Typography';
import _isEmpty from 'lodash/isEmpty';
import React, { useEffect, useState } from 'react';

import Autocomplete from 'presentation/components/common/Autocomplete';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';

import { defaultSelectedValueResolver, Option } from './Autocomplete.helper';

export type UpdatePayload = {
  name: string;
  selections: Option | Option[] | null;
};

type CustomAutocompleteProps =
  | {
      name: string;
      title: string;
      value?: string | number;
      dataTestId?: string;
      error?: string;
      isReadOnly?: boolean;
      handleUpdate: (payload: UpdatePayload) => void;
      options?: Option[] | null;
      multiple?: false;
      placeholder?: string;
      showAsterisk?: boolean;
      disableClearable?: boolean;
      disableCloseOnSelect?: boolean;
      isDisabled?: boolean;
      hidden?: boolean;
      fallbackSelectedValueResolver?: (
        options: CustomAutocompleteProps['options'],
        value: CustomAutocompleteProps['value']
      ) => Promise<Option>;
    }
  | {
      name: string;
      title: string;
      value?: string[] | number[];
      dataTestId?: string;
      error?: string;
      isReadOnly?: boolean;
      handleUpdate: (payload: UpdatePayload) => void;
      options?: Option[] | null;
      multiple?: true;
      placeholder?: string;
      showAsterisk?: boolean;
      disableClearable?: boolean;
      disableCloseOnSelect?: boolean;
      isDisabled?: boolean;
      hidden?: boolean;
      fallbackSelectedValueResolver?: (
        options: CustomAutocompleteProps['options'],
        value: CustomAutocompleteProps['value']
      ) => Promise<Option[]>;
    };

const Typography = withStyles((theme) => ({
  root: {
    padding: 10,
  },
}))(MuiTypography);

function CustomAutocomplete({
  name,
  value,
  title,
  dataTestId = '',
  error,
  isReadOnly = false,
  handleUpdate,
  multiple = false,
  options = null,
  placeholder = '',
  showAsterisk = false,
  disableClearable = false,
  disableCloseOnSelect = false,
  isDisabled = false,
  hidden = false,
  fallbackSelectedValueResolver,
}: CustomAutocompleteProps) {
  const [selectionOption, setSelectionOption] = useState<
    Option | null | undefined | Option[]
  >(multiple ? [] : null);
  const handleUpdateSelect = (_event: object, selections: any | any[]) => {
    handleUpdate({ name, selections });
  };

  const formatReadOnlyContent = () =>
    multiple
      ? (selectionOption as Option[] | undefined)
          ?.map((x) => x.title)
          .join(', ')
      : options?.find((x) => x.value === value)?.title || value;

  useEffect(() => {
    let mounted = true;
    const asyncFn = async () => {
      const selectedValue = defaultSelectedValueResolver(
        options,
        value,
        multiple
      );
      if (
        _isEmpty(selectedValue) &&
        fallbackSelectedValueResolver &&
        Boolean(value)
      ) {
        const result = await fallbackSelectedValueResolver(options, value);
        // cancel state update on unmount
        if (!mounted) {
          return;
        }
        setSelectionOption(result);
      } else {
        setSelectionOption(selectedValue);
      }
    };
    asyncFn();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, fallbackSelectedValueResolver, value]);

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={isReadOnly}
      showAsterisk={showAsterisk}
      isDisabled={isDisabled}
      hidden={hidden}
      renderBy="CustomAutocomplete"
    >
      {isReadOnly ? (
        <Typography data-testid={`${dataTestId}-readonly`}>
          {formatReadOnlyContent()}
        </Typography>
      ) : (
        <Autocomplete
          textFieldProps={{ variant: 'filled', placeholder }}
          options={options || []}
          disableClearable={disableClearable}
          disableCloseOnSelect={disableCloseOnSelect}
          multiple={multiple}
          optionTextKey="title"
          onChange={handleUpdateSelect}
          value={selectionOption}
          disabled={isDisabled}
        />
      )}
    </InputContainer>
  );
}

export default CustomAutocomplete;
