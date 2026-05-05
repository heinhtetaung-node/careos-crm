import { Chip, CircularProgress, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import styled, { StyledComponent } from 'styled-components';

import { queryStringDynamic } from 'data/gateway/api/helper/queryString.helper';
import { Color } from 'presentation/theme/variants';

import {
  getOptionLabel,
  getOptionSelected,
  loadingText,
  getFilterKey,
  addFilterData,
  formatLookupOptions,
  showListDataLookup,
  getAutoCompleteData,
  showListDataAsync,
  getAllSelectedStatus,
  getReasonNotClear,
  getOptionsValueObservable,
  getOnChangeVal,
  getSelectAllRenderer,
  getSelectedStatus,
} from './Autocomplete.helpers';
import Option from './Option';
import Poppers from './Popper';
import { MyAutoCompleteProps } from './types';

import withPopper from '../../../HOCs/WithPopper';
import { getString } from '../../../theme/localization';
import Input from '../Input';
import useAutocomplete from '../useAutocomplete';

const DEFAULT_DEBOUNCE_TIME = 800;
const DEFAULT_PLACEHOLDER = 'text.select';

const useStyles = makeStyles((theme) => ({
  AutocompleteOption: {},
  chips: {
    background: Color.BLUE_AUTOCOMPLETE,
  },
  chipsDeleteIcon: {
    color: theme.palette.primary.main,
  },
}));

const WrapperAutocomplete: StyledComponent<any, any> = styled.div`
  position: relative;
  width: 100%;
`;

function MyAutocomplete({
  label,
  popper = 'none',
  placeholder = DEFAULT_PLACEHOLDER,
  multiple = true,
  options = [],
  limitTags = 1,
  marginRight = 0,
  variant = 'standard',
  fixedLabel = false,
  onChange,
  name,
  value,
  async,
  lookup = false,
  asyncFn,
  lookupFn,
  searchFn,
  labelField = 'title',
  valueField = labelField,
  filterDataField,
  filterDataValue,
  startWithValue,
  disableClearable = false,
  disabledOptions = false,
  hasSelectAll = false,
  loading = false,
  disabled = false,
  /**
   * TODO There is a limitation with the pagination implementation
   * wherein, searches made with the input text don't search through
   * all of the options from the database, and only search through the
   * existing options.
   */
  paginate = false,
  pageSize = 100,
  testid = 'common-my-complete',
  onFocusFn,
  isEditable = true,
  firstOption,
  hasFormattedResponse = false,
  apiDataField = '',
  missingId = false,
  idField = '',
  ...rest
}: MyAutoCompleteProps) {
  const classes = useStyles();
  const inputRef: any = useRef();
  const [open, setOpen] = useState<boolean>(false);
  const [_options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  const [_placeholder, setPlaceholder] = useState<string>('');
  const [isFalseApi, setIsFalseApi] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<any>([]);
  const [pageToken, setPageToken] = useState<string>('');
  const { handleFilterOptions } = useAutocomplete();

  useEffect(() => {
    if (!value && selectedOptions?.length > 0) {
      setSelectedOptions([]);
    }
  }, [value]);

  const allSelected = getAllSelectedStatus(multiple, _options, selectedOptions);

  const fetchOptions = (val: any) => {
    rest?.onFocus?.(val);
    if (onFocusFn) {
      onFocusFn().then((response: any) => {
        if (response && !response.isError && response.data) {
          if (apiDataField && apiDataField !== '') {
            const allOptionsData = response.data[apiDataField];

            if (missingId) {
              const newAllOptions = allOptionsData.map((option: any) => ({
                value: option[valueField],
                ...option,
                id: option[idField],
                key: option[idField],
              }));

              if (startWithValue) {
                setOptions([startWithValue, ...newAllOptions]);
              } else {
                setOptions(newAllOptions);
              }
              return;
            }

            if (startWithValue) {
              setOptions([startWithValue, ...allOptionsData]);
            } else {
              setOptions(allOptionsData);
            }
            return;
          }
          if (!hasFormattedResponse) {
            const newResponse = response.data.map((resp: any) => ({
              ...resp,
              id: resp.name,
              value: resp.name,
            }));
            setOptions(newResponse);
          } else {
            setOptions(response.data);
          }
        }
      });
      return;
    }

    if (!async || !asyncFn) return;

    if (!paginate) setOptions([]);
    setIsLoading(true);
    const filter = queryStringDynamic({
      [labelField]: { value: getFilterKey(val) },
      ...addFilterData({
        field: filterDataField,
        value: filterDataValue,
      }),
    });

    const optionsValue = getOptionsValueObservable(
      asyncFn,
      startWithValue,
      filter,
      labelField,
      pageSize,
      pageToken
    );

    optionsValue.subscribe({
      next: (res: any) => {
        // Determines the field or value to be formatted.
        const field = lookup ? labelField : valueField;
        // Determines how the data should be formatted.
        const formatData = lookup ? showListDataLookup : showListDataAsync;
        const data = paginate ? res.data : res;

        let newOptions = formatData(getAutoCompleteData(data), field);

        const { nextPageToken } = res;

        if (paginate && nextPageToken !== '') {
          newOptions = [..._options, ...newOptions];
          setPageToken(nextPageToken as string);
        }

        setOptions(newOptions);
        setIsLoading(false);
      },
      error: (e) => {
        setIsFalseApi(true);
      },
    });
  };

  /**
   * Fetches more options when scrolling to the bottom of the list if
   * paginate flag is enabled and if the next page token exists.
   * @param event
   */
  const onScrollToBottom = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight ===
      listboxNode.scrollHeight
    ) {
      if (!isLoading && paginate && pageToken !== '') {
        fetchOptions('');
      }
    }
  };

  const handleToggleOption = (sltOptions: any) =>
    setSelectedOptions(sltOptions);
  const handleClearOptions = () => setSelectedOptions([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInputValueChange = useCallback(
    debounce((e: React.ChangeEvent<{ value: string }>) => {
      if (searchFn) {
        setIsLoading(true);
        searchFn(e.target.value)
          .then((res) => setOptions(res ?? []))
          .finally(() => setIsLoading(false));
      }
    }, DEFAULT_DEBOUNCE_TIME),
    []
  );

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedOptions(_options);
    } else {
      handleClearOptions();
    }
  };

  const handleToggleSelectAll = () => {
    handleSelectAll(!allSelected);
  };

  const handleChange = (
    event: any,
    allSelectedOptions: any,
    reason: string
  ) => {
    if (onChange == null) return;
    if (disabledOptions && reason === 'select-option') return;
    if (getReasonNotClear(reason)) {
      if (multiple) {
        if (allSelectedOptions.find((option: any) => option?.value === 'all')) {
          handleToggleSelectAll();
        } else {
          handleToggleOption(allSelectedOptions);
        }
      } else {
        handleToggleOption(allSelectedOptions);
      }
    } else if (reason === 'clear') {
      handleClearOptions();
    }
    const val = getOnChangeVal({
      reason,
      multiple,
      allSelectedOptions,
      allSelected,
      _options,
    });
    onChange(
      {
        ...event,
        target: {
          ...event.target,
          name,
          value: val,
        },
      },
      val,
      reason
    );
  };

  const optionRenderer = (option: any, { selected }: any) => {
    const isSelectAll = getSelectAllRenderer(selectedOptions, _options);
    return (
      <Option
        disabled={!selected && disabledOptions}
        multiple={multiple}
        marginRight={marginRight}
        selected={getSelectedStatus(selected, isSelectAll)}
        option={option}
        numOptions={_options.length}
        label={labelField}
      />
    );
  };

  const renderTags = (value: any[], getTagProps: any) => {
    const limitedValue = limitTags > 0 ? value.slice(0, limitTags) : value;
    const remainingCount = value.length - limitTags;
    return (
      <>
        {limitedValue.map((option: any, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              {...tagProps}
              size="small"
              deleteIcon={<CloseIcon />}
              disabled={!isEditable}
              classes={{
                root: classes.chips,
                deleteIcon: classes.chipsDeleteIcon,
              }}
              label={getOptionLabel(option, labelField, multiple)}
            />
          );
        })}
        {remainingCount > 0 && (
          <Chip
            size="small"
            disabled={!isEditable}
            classes={{
              root: classes.chips,
            }}
            label={`+${remainingCount} more`}
          />
        )}
      </>
    );
  };

  const inputRenderer = (params: any) => (
    <Input
      {...params}
      generic
      placeholder={getString(_placeholder)}
      variant={variant}
      label={label}
      name={name}
      value={value}
      fixedLabel={fixedLabel}
      onChange={handleInputValueChange}
      InputProps={{
        ...params.InputProps,
        readOnly: !isEditable,
        endAdornment: (
          <>
            {isLoading ? (
              <CircularProgress
                color="inherit"
                size={20}
                data-testid="common-my-complete__circular"
              />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        ),
        disableUnderline: true,
      }}
    />
  );

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    setPlaceholder(value && value.length ? '' : placeholder);
  }, [placeholder, value]);

  useEffect(() => {
    if (typeof value === 'object') {
      setSelectedOptions(value);
    }
  }, [value]);

  useEffect(() => {
    if (!lookupFn && !async && !onFocusFn) {
      setOptions(options);
    }
  }, [options, lookupFn, async, onFocusFn]);

  useEffect(() => {
    const destroyComponent$ = new Subject();
    if (lookupFn) {
      lookupFn()
        .pipe(takeUntil(destroyComponent$))
        .subscribe(
          (res: any) => {
            const lookupOptions = formatLookupOptions(res, {
              label: labelField,
              value: valueField,
            });
            setOptions(lookupOptions);
          },
          () => setIsFalseApi(true)
        );
    }
    return () => {
      destroyComponent$.next(true);
    };
  }, [labelField, lookupFn, valueField]);

  return (
    <WrapperAutocomplete>
      <Autocomplete
        classes={{
          option: classes.AutocompleteOption,
        }}
        popupIcon={<KeyboardArrowDownIcon />}
        PopperComponent={withPopper(Poppers, popper)}
        ListboxProps={{
          style: { maxHeight: '15rem', position: 'bottom' },
          onScroll: paginate ? onScrollToBottom : undefined,
        }}
        open={open}
        onOpen={() => {
          if (isEditable) setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onFocus={fetchOptions}
        options={_options}
        limitTags={limitTags}
        multiple={multiple}
        ref={inputRef}
        className="shared-autocomplete"
        data-testid={testid}
        value={selectedOptions}
        disableCloseOnSelect={multiple}
        loadingText={loadingText(isFalseApi)}
        noOptionsText={getString('text.dataIsUnavailable')}
        getOptionLabel={(option: any) =>
          getOptionLabel(option, labelField, multiple)
        }
        getOptionSelected={(optionOne: any, optionTwo: any) =>
          getOptionSelected(
            optionOne,
            optionTwo,
            missingId ? valueField : undefined
          )
        }
        filterOptions={(opts: any, params: any) =>
          searchFn
            ? opts
            : handleFilterOptions(
                hasSelectAll,
                firstOption ? [firstOption, ...opts] : opts,
                params
              )
        }
        onChange={handleChange}
        renderOption={optionRenderer}
        renderInput={inputRenderer}
        renderTags={multiple ? renderTags : undefined}
        ChipProps={{
          size: 'small',
          deleteIcon: <CloseIcon />,
          disabled: !isEditable,
          classes: { root: classes.chips, deleteIcon: classes.chipsDeleteIcon },
        }}
        loading={isLoading}
        disableClearable={!isEditable || disableClearable}
        disabled={disabled}
      />
    </WrapperAutocomplete>
  );
}

export default MyAutocomplete;
