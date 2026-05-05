/* eslint-disable jsx-a11y/label-has-associated-control */
import { alpha, makeStyles } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  FilterOptionsState,
} from '@material-ui/lab';
import { UseLazyQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryDefinition,
} from '@reduxjs/toolkit/query';
import _omit from 'lodash/omit';
import * as React from 'react';

import { getString } from 'presentation/theme/localization';

import Chip from '../Chip';
import CommonTextField from '../CommonTextField/CommonTextField';

interface IAutocompleteProps<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  type?: 'default' | 'checkbox' | 'icon' | 'label';
  optionTextKey?: string;
  optionIconKey?: string;
  optionLabelKey?: string;
  allowAddNew?: boolean;
  onAddNew?: React.Dispatch<any>;
  filterAddNew?: (options: any, state: FilterOptionsState<any>) => any;
  chipTagProps?: object;
  textFieldProps?: object;
  async?: boolean;
  lookup?: string;
  callback?: (entity: Record<PropertyKey, any>) => {
    title: string;
    value: string;
  };
  queryParams?: string;
  useLazyQuery?: UseLazyQuery<
    QueryDefinition<
      any,
      BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        any,
        FetchBaseQueryMeta
      >,
      string,
      any,
      string
    >
  >;
  filterPanel?: boolean;
  label?: string;
}

export type IAutocompletePropsOverrided<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> = Omit<
  IAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  'renderInput'
> & {
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
};

const useStyles = makeStyles((theme) => ({
  popper: {
    // minWidth: 'max-content',
    maxWidth: '100%',
  },
  paper: {
    '&.MuiPaper-rounded': {
      borderRadius: 0,
      backgroundColor: 'transparent',
    },
  },
  noOptions: {
    padding: '8px 8px 8px 10px',
    minWidth: '220px',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: `4px`,
    backgroundColor: '#FFFFFF',
  },
  option: {
    padding: '8px 8px 8px 10px',
    // height: '36px',
    minHeight: '36px',
    minWidth: '220px',
    fontSize: '14px',
    color: theme.palette.text.primary,
    '& .labelOptionType': {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    '& svg,& image': {
      width: '26px',
      paddingRight: '11.5px',
    },
    '& .MuiCheckbox-root': {
      paddingLeft: 0,
      paddingRight: 0,
      color: theme.palette.grey[200],
      '&.Mui-checked': {
        color: theme.palette.primary.main,
      },
      '&:hover': {
        backgroundColor: 'unset',
      },
    },
    '&[aria-selected="true"]': {
      color: theme.palette.primary.main,
      backgroundColor: '#FFFFFF',
    },
    '&[data-focus="true"]': {
      backgroundColor: alpha(theme.palette.grey[200], 0.33),
    },
    '&[aria-disabled="true"]': {
      opacity: 1,
      color: theme.palette.grey[400],
      '& svg,& image': {
        color: theme.palette.grey[200],
      },
    },
  },
  listbox: {
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: `4px`,
    maxHeight: '30vh',
    overflow: 'overlay',
    backgroundColor: '#FFFFFF',
    '&::-webkit-scrollbar': {
      width: '7px',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: alpha(theme.palette.common.black, 0.5),
      borderRadius: '20px',
    },
    // Firefox scrollbar
    scrollbarColor: `${alpha(theme.palette.common.black, 0.5)} transparent`,
    scrollbarWidth: 'thin',
  },
}));

function Autocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  type = 'default',
  optionTextKey = 'text',
  optionIconKey = 'icon',
  optionLabelKey = 'label',
  allowAddNew = false,
  onAddNew,
  filterAddNew,
  chipTagProps = {},
  textFieldProps = {},
  async = false,
  lookup = '',
  callback,
  queryParams = '',
  useLazyQuery = (() => []) as any,
  filterPanel = false,
  ...props
}: IAutocompletePropsOverrided<T, Multiple, DisableClearable, FreeSolo>) {
  let propsCopy = { ...props };

  // Use getOptionDisabled to disable options based on the 'disabled' field
  propsCopy.getOptionDisabled = (option: any) => !!option?.disabled;

  const renderInput = (params: any) => (
    <CommonTextField {...textFieldProps} {...params} />
  );
  const [trigger, { data, isFetching } = { data: {}, isFetching: false }] =
    useLazyQuery();

  propsCopy = {
    forcePopupIcon: true,
    popupIcon: <ExpandMore />,
    onFocus: () => {
      if (async) {
        trigger(queryParams, true);
      }
    },
    noOptionsText: getString('text.noOptionsFound'),
    renderOption: (option: any) => (
      <div
        style={{ color: option?.disabled ? 'gray' : 'inherit' }} // Visually indicate disabled state
      >
        {option[optionTextKey] ?? option}
      </div>
    ),
    getOptionLabel: (option: any) => option[optionTextKey] ?? option,
    renderTags: (value, getTagProps) =>
      value.map((option: any, index) => {
        const renderTagProps: any = { ...getTagProps({ index }) };
        return (
          <Chip
            {...renderTagProps}
            {...chipTagProps}
            text={option[optionTextKey] ?? option}
            handleDelete={renderTagProps.onDelete}
          />
        );
      }),
    renderInput,
    ...propsCopy,
  };

  if (async && isFetching) {
    propsCopy.loading = isFetching;
  }

  if (async && data && !isFetching) {
    propsCopy.options = [...propsCopy.options, ...data[lookup].map(callback)];
  }

  if (filterPanel) {
    const { onChange: handleOnChange } = propsCopy;
    if (handleOnChange) {
      propsCopy.onChange = (event: any, value, reason) => {
        // FilterPanel component expect event.target to have name and value
        // which normally don't have in autocomplete component.
        handleOnChange(
          {
            ...event,
            target: {
              ...event.target,
              name: (textFieldProps as any).name,
              value,
            },
          },
          value,
          reason
        );
      };
    }
  }

  switch (type) {
    case 'checkbox':
      propsCopy = {
        ...propsCopy,
        multiple: true as Multiple,
        disableCloseOnSelect: true,
        renderOption: (option: any, { selected }) => (
          <>
            <Checkbox
              color="primary"
              size="small"
              checked={selected}
              disabled={option?.disabled} // Disable checkbox if option is disabled
            />
            {option[optionTextKey] ?? option}
          </>
        ),
      };
      break;
    case 'icon':
      propsCopy = {
        ...propsCopy,
        renderOption: (option: any) => (
          <>
            {option[optionIconKey]}
            {option[optionTextKey] ?? option}
          </>
        ),
      };
      break;
    case 'label':
      propsCopy = {
        ...propsCopy,
        renderOption: (option: any) => (
          <div className="labelOptionType">
            {option[optionTextKey]}
            <Chip {...option[optionLabelKey]} />
          </div>
        ),
      };
      break;
    default:
  }

  if (allowAddNew) {
    propsCopy = {
      ...propsCopy,
      renderOption: (option: any) => {
        if (option.inputValue) {
          return (
            <>
              {getString('text.add')}
              &nbsp;
              <strong>{`“${option.inputValue}”`}</strong>
            </>
          );
        }
        return option[optionTextKey] ?? option;
      },
      onChange: (_event, newValue: any) => {
        if (!onAddNew) return;
        if (!newValue) return;

        if (props.multiple) {
          newValue.map((item: any) => ({
            [optionTextKey]: item.inputValue,
          }));
          onAddNew(newValue);
        } else {
          onAddNew(newValue.inputValue);
        }
      },
      filterOptions: (options, params) => {
        if (!filterAddNew) return [];

        const filtered = filterAddNew(options, params);
        if (filtered.length > 0 || params.inputValue === '') return filtered;

        filtered.push({
          inputValue: params.inputValue,
          [optionTextKey]: params.inputValue,
        });
        return filtered;
      },
      getOptionLabel: (option: any) => {
        if (typeof option === 'string') return option;
        if (option.inputValue) return option.inputValue;
        return option[optionTextKey] ?? option;
      },
    };
  }

  const classes = useStyles();
  const { label } = propsCopy;
  propsCopy = _omit(propsCopy, ['label', 'filterType']) as any;

  // is this component use in filter panel?
  if (filterPanel) {
    return (
      <>
        <label className="text-[10px]">{label}</label>
        <MuiAutocomplete
          data-testid="custom-autocomplete"
          renderInput={renderInput}
          classes={{ ...classes }}
          {...propsCopy}
        />
      </>
    );
  }

  return (
    <MuiAutocomplete
      data-testid="custom-autocomplete"
      renderInput={renderInput}
      classes={{ ...classes }}
      {...propsCopy}
    />
  );
}

export default Autocomplete;
