import { render } from '@testing-library/react';
import React from 'react';

import MyAutocomplete from '../Autocomplete/Autocomplete';

test('render MyAutoComplete view successfully', () => {
  const { getByTestId } = render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
    />
  );
  expect(getByTestId('common-my-complete')).toBeTruthy();
});

test('render MyAutoComplete view case have no `hasSelectAll` props', () => {
  const { queryByTestId } = render(
    <MyAutocomplete
      options={[]}
      limitTags={1}
      marginRight={0}
      variant="standard"
      fixedLabel={false}
      lookup={false}
      name="test"
      labelField="title"
      valueField="title"
      hasSelectAll
    />
  );
  expect(queryByTestId('option-select-all')).toBeFalsy();
});
