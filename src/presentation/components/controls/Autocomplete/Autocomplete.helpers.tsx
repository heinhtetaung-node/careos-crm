import { Observable, iif } from 'rxjs';
import { reduce, startWith } from 'rxjs/operators';

import ResponseModel from 'models/response';
import { getString } from 'presentation/theme/localization';

import { AsyncOptions } from './types';

export enum SelectReason {
  SELECT_OPTION = 'select-option',
  REMOVE_OPTION = 'remove-option',
  CLEAR = 'clear',
}

export const getOptionLabel = (
  option: any,
  labelField: string,
  multiple: boolean
) => {
  if (option) {
    return !multiple
      ? option[labelField] || ''
      : option[labelField] || getString('text.selectAll');
  }
  return getString('text.selectAll');
};

export const getOptionSelected = (
  option: any,
  anotherOption: any,
  valueField = 'value'
) => {
  if (option && anotherOption) {
    return option[valueField] === anotherOption[valueField];
  }
  return false;
};

export const loadingText = (isFalseApi: boolean) => {
  if (!isFalseApi) {
    return getString('text.loading');
  }
  return getString('text.dataIsUnavailable');
};

export const showListDataLookup = (autoCompleteData: any, labelField: any) =>
  autoCompleteData.map((item: any, index: number) =>
    typeof item === 'string'
      ? {
          id: index,
          title: item,
          value: item,
        }
      : {
          id: item.key,
          [labelField]: item.value,
          value: item.key,
        }
  );

export const showListDataAsync = (autoCompleteData: any, valueField: any) =>
  autoCompleteData.map((item: any, index: number) =>
    typeof item === 'string'
      ? {
          id: index,
          value: item,
          title: item,
        }
      : {
          ...item,
          id: index,
          value: item[valueField],
        }
  );

export const getFilterKey = (val: any) => (typeof val !== 'string' ? '' : val);

export const getAutoCompleteData = (res: any) => {
  let autoCompleteData = res.selectData || res;

  if (!Array.isArray(autoCompleteData)) {
    autoCompleteData = [];
  }

  return autoCompleteData;
};

export const addFilterData = ({ field, value }: any) => {
  if (!field) return {};
  return { [field]: value };
};

export const getSelectAllProps = (option: any, allSelected: any) => {
  if (option.value === 'all') return { checked: allSelected };
  return {};
};

export const formatLookupOptions = (res: any, { label, value }: any) =>
  res.map((item: any, index: number) => ({
    id: index,
    [label]: item[label],
    value: item[value],
  }));

export const handleReducer = (accumulator: any, currentValue: any) =>
  accumulator.concat(currentValue);

export const getOptionsValue = ({ startWithValue, optionsBaseValue }: any) =>
  iif(
    () => Boolean(startWithValue),
    optionsBaseValue.pipe(startWith(startWithValue), reduce(handleReducer, [])),
    optionsBaseValue
  );

export const getOptionsValueObservable = (
  asyncFn: (props: AsyncOptions) => Observable<ResponseModel<any>>,
  startWithValue?: { [key: string]: string },
  filter?: string,
  labelField?: string,
  pageSize?: number,
  pageToken?: string
) => {
  const orderBy = `&orderBy=${labelField}`;
  const optionsBaseValue = asyncFn({ filter, orderBy, pageSize, pageToken });
  const optionsValue = getOptionsValue({ startWithValue, optionsBaseValue });
  return optionsValue;
};

export const showQuantity = (label: any, count: number) => {
  if (!label)
    return `${
      count > 1
        ? getString('text.items', { count })
        : getString('text.item', { count })
    }`;
  return '';
};

export const getAllSelectedStatus = (
  multiple: boolean,
  options: any,
  selectedOptions: any
) => multiple && options.length === selectedOptions.length;

export const getReasonNotClear = (reason: string) =>
  reason === SelectReason.SELECT_OPTION ||
  reason === SelectReason.REMOVE_OPTION;

export const getOnChangeVal = ({
  reason,
  multiple,
  allSelectedOptions,
  allSelected,
  _options,
}: any) => {
  let val: any;
  if (getReasonNotClear(reason)) {
    if (multiple) {
      if (allSelectedOptions.find((option: any) => option.value === 'all')) {
        if (!allSelected) {
          val = [..._options];
        } else {
          val = [];
        }
      } else {
        val = [...allSelectedOptions];
      }
    } else {
      val = { ...allSelectedOptions };
    }
  } else if (reason === SelectReason.CLEAR) {
    val = [...(allSelectedOptions ?? [])];
  }
  return val;
};

export function arraysContainsSameObjectFieldData(
  arr1: any,
  arr2: any,
  key = 'value'
) {
  if (!arr1 || !arr2) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }
  const frequencyMap = new Map();
  // Count the frequency of each item in arr1
  arr1.forEach((item: any) => {
    if (frequencyMap.has(item[key])) {
      frequencyMap.set(item[key], frequencyMap.get(item[key]) + 1);
    } else {
      frequencyMap.set(item[key], 1);
    }
  });

  // Check if each item in arr2 decreases the frequency to at least 0
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr2) {
    if (!frequencyMap.has(item[key])) {
      return false;
    }
    frequencyMap.set(item[key], frequencyMap.get(item[key]) - 1);
    if (frequencyMap.get(item[key]) < 0) {
      return false;
    }
  }

  return true;
}

export const getSelectAllRenderer = (sltOptions: any, options: any) => {
  if (options.length === 0) {
    return false;
  }
  return arraysContainsSameObjectFieldData(sltOptions, options);
};

export const getSelectedStatus = (selected: any, isSelectAll: any) =>
  selected || isSelectAll;
