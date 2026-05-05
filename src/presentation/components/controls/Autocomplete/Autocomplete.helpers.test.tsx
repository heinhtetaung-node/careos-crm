import { of } from 'rxjs';

import { queryStringDynamic } from 'data/gateway/api/helper/queryString.helper';
import ResponseModel from 'models/response';

import {
  getOptionLabel,
  getOptionSelected,
  loadingText,
  showListDataAsync,
  showListDataLookup,
  getFilterKey,
  getAutoCompleteData,
  addFilterData,
  getSelectAllProps,
  formatLookupOptions,
  getOptionsValue,
  getOptionsValueObservable,
  handleReducer,
  showQuantity,
  getAllSelectedStatus,
  getReasonNotClear,
  getOnChangeVal,
  getSelectAllRenderer,
  getSelectedStatus,
  arraysContainsSameObjectFieldData,
} from './Autocomplete.helpers';

test('should getOptionLabel behavior run well in 1st case multiple choice', () => {
  const option = {
    title: 'Duy Nguyen',
    value: 'duynt',
  };
  const labelField = 'title';
  expect(getOptionLabel(option, labelField, true)).toEqual('Duy Nguyen');
});

test('should getOptionLabel behavior run well in 2nd case multiple choice', () => {
  const option = {
    title: '',
    value: 'duynt',
  };
  const labelField = 'title';
  expect(getOptionLabel(option, labelField, true)).toEqual('text.selectAll');
});

test('should getOptionLabel behavior run well in 1st case single choice', () => {
  const option = {
    title: 'Duy Nguyen',
    value: 'duynt',
  };
  const labelField = 'title';
  expect(getOptionLabel(option, labelField, false)).toEqual('Duy Nguyen');
});

test('should getOptionLabel behavior run well in 2nd case single choice', () => {
  const option = {
    title: '',
    value: 'duynt',
  };
  const labelField = 'title';
  expect(getOptionLabel(option, labelField, false)).toEqual('');
});

test('should getOptionSelected behavior run well in truthy case', () => {
  const option1 = {
    title: 'Duy Nguyen',
    value: 'duynt',
  };
  const option2 = { ...option1 };
  expect(getOptionSelected(option1, option2)).toEqual(true);
});

test('should getOptionSelected behavior run well in falsy case', () => {
  const option1 = {
    title: 'Duy Nguyen',
    value: 'duynt',
  };
  const option2 = {
    title: 'Duy Nguyen',
    value: 'duynt2',
  };
  expect(getOptionSelected(option1, option2)).toEqual(false);
});

test('should loadingText behavior run well in truthy case', () => {
  expect(loadingText(true)).toEqual('text.dataIsUnavailable');
});

test('should loadingText behavior run well in falsy case', () => {
  expect(loadingText(false)).toEqual('text.loading');
});

test('check show list data lookup with string input', () => {
  const autoCompleteData = ['duynt'];
  const labelField = 'title';
  expect(showListDataLookup(autoCompleteData, labelField)).toEqual([
    {
      id: 0,
      title: 'duynt',
      value: 'duynt',
    },
  ]);
});

test('check show list data lookup with object input', () => {
  const autoCompleteData = [
    {
      title: 'DuyNguyen',
      value: 'duynt',
      key: 0,
    },
  ];
  const labelField = 'title';
  expect(showListDataLookup(autoCompleteData, labelField)).toEqual([
    {
      id: 0,
      title: 'duynt',
      value: 0,
    },
  ]);
});

test('check show list data async with string input', () => {
  const autoCompleteData = ['duynt'];
  const valueField = 'title';
  expect(showListDataAsync(autoCompleteData, valueField)).toEqual([
    {
      id: 0,
      title: 'duynt',
      value: 'duynt',
    },
  ]);
});

test('check show list data async with object input', () => {
  const input = [
    {
      title: 'Duy Nguyen',
      value: 'duynt',
    },
  ];
  const valueField = 'value';
  expect(showListDataAsync(input, valueField)).toEqual([
    {
      id: 0,
      title: 'Duy Nguyen',
      value: 'duynt',
    },
  ]);
});

test('check getFilterKey run well with string input type', () => {
  expect(getFilterKey('Duy Nguyen')).toEqual('Duy Nguyen');
});

test('check getFilterKey run well with the other input types', () =>
  expect(getFilterKey({ name: 'duynt' })).toEqual(''));

test('check getAutoCompleteData run well with res input case 1st', () => {
  const res = {
    selectData: ['Item'],
  };
  expect(getAutoCompleteData(res)).toEqual(['Item']);
});

test('check getAutoCompleteData run well with res input case 2nd', () => {
  const res = {
    selectData: 'String value',
  };
  expect(getAutoCompleteData(res)).toEqual([]);
});

test('check getAutoCompleteData run well with res input case 3rd', () => {
  const res = {};
  expect(getAutoCompleteData(res)).toEqual([]);
});

test('check addFilterData run well with res input case 1st', () => {
  const input = {
    field: 'name',
    value: 'Duy Nguyen',
  };
  expect(addFilterData(input)).toEqual({
    name: 'Duy Nguyen',
  });
});

test('check addFilterData run well with res input case 2nd', () => {
  const input = {};
  expect(addFilterData(input)).toEqual({});
});

test('check getSelectAllProps run well with res input case 1st', () => {
  expect(getSelectAllProps({ value: 'option_1' }, [])).toEqual({});
});

test('check getSelectAllProps run well with res input case 2nd', () => {
  expect(getSelectAllProps({ value: 'all' }, [])).toEqual({
    checked: [],
  });
});

test('check formatLookupOptions run well', () => {
  expect(formatLookupOptions([], { value: 'value', label: 'label' })).toEqual(
    []
  );
});

test('check queryStringDynamic run well', () => {
  const input = {
    name: { value: 'Duy Nguyen' },
    ...addFilterData({
      field: 'Duy NT',
      value: 'duynt',
    }),
  };
  expect(queryStringDynamic(input)).toEqual('name: "Duy Nguyen"');
});

test('check getOptionsValueObservable run well', () => {
  expect(
    getOptionsValueObservable(
      () => of(ResponseModel.createSuccess([1, 2])),
      { title: 'title' },
      'label'
    )
  ).not.toEqual({
    _isScalar: false,
    operator: { defaultValue: [] },
    source: {
      _isScalar: false,
      operator: { total: 1 },
      source: {
        _isScalar: false,
        operator: { accumulator: () => null, hasSeed: true, seed: [] },
        source: {
          _isScalar: false,
          operator: { concurrent: 1, project: () => null },
          source: { _isScalar: false },
        },
      },
    },
  });
});

test('check getOptionsValue run well case truthy startWithValue input', () => {
  const input = {
    startWithValue: 'start_txt',
    optionsBaseValue: of([1, 2]),
  };
  expect(getOptionsValue(input)).not.toEqual(null);
});

test('check getOptionsValue run well case falsy startWithValue input', () => {
  const input = {
    startWithValue: '',
    optionsBaseValue: of([1, 2]),
  };
  expect(getOptionsValue(input)).not.toEqual(null);
});

test('check handleReducer run well', () => {
  expect(handleReducer([1], [2, 3])).toEqual([1, 2, 3]);
});

test('check showQuantity run well with input less than 2', () => {
  expect(showQuantity('', 0)).toEqual('text.item');
});

test('check showQuantity run well with input equal and greater than 2', () => {
  expect(showQuantity('', 2)).toEqual('text.items');
});

test('check showQuantity run well when input is text label', () => {
  expect(showQuantity('Option 1', 2)).toEqual('');
});

test('check getAllSelectedStatus run well 1', () => {
  expect(getAllSelectedStatus(true, [], [])).toEqual(true);
});

test('check getAllSelectedStatus run well 2', () => {
  expect(getAllSelectedStatus(true, [], {})).toEqual(false);
});

test('check getAllSelectedStatus run well 3', () => {
  expect(getAllSelectedStatus(false, [], [])).toEqual(false);
});

test('check getAllSelectedStatus run well 4', () => {
  expect(getAllSelectedStatus(false, [], {})).toEqual(false);
});

test('check getReasonNotClear run well 1', () => {
  expect(getReasonNotClear('select-option')).toEqual(true);
});

test('check getReasonNotClear run well 2', () => {
  expect(getReasonNotClear('clear')).toEqual(false);
});

describe('check getOnChangeVal', () => {
  const _options = [
    {
      title: 'Duy Nguyen',
      value: 'duyng',
    },
    {
      title: 'Tri Lee',
      value: 'trilee',
    },
    {
      title: 'Weerapat Top',
      value: 'weerapattop',
    },
  ];
  const reason1 = 'select-option';
  const reason2 = 'clear';
  test('check getOnChangeVal run well 1.1.1.1', () => {
    const input = {
      reason: reason1,
      multiple: true,
      allSelectedOptions: [
        {
          title: 'Tri Lee',
          value: 'trilee',
        },
        {
          title: 'Select all',
          value: 'all',
        },
      ],
      allSelected: false,
      _options,
    };
    expect(getOnChangeVal(input)).toEqual(_options);
  });

  test('check getOnChangeVal run well 1.1.1.2', () => {
    const input = {
      reason: reason1,
      multiple: true,
      allSelectedOptions: [
        {
          title: 'Tri Lee',
          value: 'trilee',
        },
        {
          title: 'Select all',
          value: 'all',
        },
      ],
      allSelected: true,
      _options,
    };
    expect(getOnChangeVal(input)).toEqual([]);
  });

  test('check getOnChangeVal run well 1.1.1.2', () => {
    const input = {
      reason: reason1,
      multiple: true,
      allSelectedOptions: [
        {
          title: 'Tri Lee',
          value: 'trilee',
        },
      ],
      allSelected: true,
      _options,
    };
    expect(getOnChangeVal(input)).toEqual([
      {
        title: 'Tri Lee',
        value: 'trilee',
      },
    ]);
  });

  test('check getOnChangeVal run well 2', () => {
    const input = {
      reason: reason2,
      multiple: true,
      allSelectedOptions: [
        {
          title: 'Tri Lee',
          value: 'trilee',
        },
      ],
      allSelected: true,
      _options,
    };
    expect(getOnChangeVal(input)).toEqual([
      {
        title: 'Tri Lee',
        value: 'trilee',
      },
    ]);
  });
});

test('check getSelectAllRenderer run well 1st', () => {
  expect(
    getSelectAllRenderer(
      [
        {
          title: 'One',
          value: 1,
        },
      ],
      []
    )
  ).toEqual(false);
});

test('check getSelectAllRenderer run well 2nd', () => {
  expect(getSelectAllRenderer({}, [])).toEqual(false);
});

test('check getSelectedStatus run well 1st', () => {
  expect(getSelectedStatus(true, true)).toEqual(true);
});

test('check getSelectedStatus run well 2nd', () => {
  expect(getSelectedStatus(false, true)).toEqual(true);
});

describe('arraysContainsSameObjectFieldData', () => {
  it('returns false when null or undefined is passed', () => {
    const result = arraysContainsSameObjectFieldData(undefined, null, 'id');
    expect(result).toBeFalsy();
  });

  it('returns true when items match', () => {
    const result = arraysContainsSameObjectFieldData(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ id: 2 }, { id: 3 }, { id: 1 }],
      'id'
    );
    expect(result).toBeTruthy();
  });

  it('returns false when items dont match', () => {
    const result = arraysContainsSameObjectFieldData(
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ id: 4 }, { id: 3 }, { id: 2 }],
      'id'
    );
    expect(result).toBeFalsy();
  });

  it('returns true when items match', () => {
    const result = arraysContainsSameObjectFieldData(
      [
        { id: 1, value: 1, name: 'One' },
        { id: 2, value: 2, name: 'Two' },
        { id: 3, value: 3, name: 'Three' },
      ],
      [
        { id: 2, value: 2, name: 'Two' },
        { id: 3, value: 3, name: 'Three' },
        { id: 1, value: 1, name: 'One' },
      ],
      'name'
    );
    expect(result).toBeTruthy();
  });

  it('returns false when items match', () => {
    const result = arraysContainsSameObjectFieldData(
      [
        { id: 1, value: 1, name: 'One' },
        { id: 2, value: 2, name: 'Two' },
        { id: 3, value: 3, name: 'Threee' },
      ],
      [
        { id: 2, value: 2, name: 'Two' },
        { id: 3, value: 3, name: 'Three' },
        { id: 1, value: 1, name: 'One' },
      ],
      'name'
    );
    expect(result).toBeFalsy();
  });
});
