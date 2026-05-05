import React from 'react';

import MyAutocomplete from './Autocomplete/Autocomplete';

enum FilterType {
  Product = 'product',
  LeadType = 'leadType',
}

export default function TypeSelector({
  popper,
  classes,
  type,
  label,
  name,
  value,
  onChange,
  multiple,
  disableCloseOnSelect,
  options,
  ...rest
}: any & {
  label?: string;
  type: FilterType;
  name: string;
  value: string;
  multiple: boolean;
  onChange: () => unknown;
}) {
  return (
    <MyAutocomplete
      popper={popper}
      options={options}
      onChange={onChange}
      label={label}
      name={name}
      value={value}
      multiple={multiple}
      disableCloseOnSelect={disableCloseOnSelect}
      {...rest}
    />
  );
}

TypeSelector.defaultProps = {
  label: '',
};
