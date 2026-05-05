import { renderHook } from '@testing-library/react';

import useAutocomplete, { followConditions } from './useAutocomplete';

test('should useOrderQCState behavior run well', () => {
  const response = renderHook(() => useAutocomplete());

  expect(response.result).toBeDefined();
});

test('should followConditions behavior run well with falsy hasSelectAll', () => {
  const params = {
    inputValue: '',
  };
  expect(followConditions(false, params, [])).toEqual([]);
});

test('should followConditions behavior run well with truthy hasSelectAll', () => {
  const params = {
    inputValue: '',
  };
  expect(followConditions(true, params, [])).toEqual([
    { label: 'text.selectAll', value: 'all' },
  ]);
});
