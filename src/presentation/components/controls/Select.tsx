import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  InputLabelProps,
  makeStyles,
  SelectProps,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import ResponseModel from 'models/response';
import { Color } from 'presentation/theme/variants';
import './Select.scss';

const useStyles = makeStyles(() => ({
  label: {
    '&.MuiFormLabel-root.Mui-error': {
      color: 'black',
    },
  },
  menuItem: {
    whiteSpace: 'normal',
    '&:hover': {
      background: Color.BLUE_AUTOCOMPLETE,
    },
    '&[aria-selected="true"]': {
      background: Color.BLUE_AUTOCOMPLETE,
    },
    '&[data-focus="true"]': {
      background: Color.BLUE_AUTOCOMPLETE,
    },
  },
  text: {
    maxWidth: 'fit-content',
  },
  select: {
    '&.Mui-error': {
      '& .MuiSelect-select': {
        borderColor: 'red',
        '&:hover': {
          borderColor: 'red',
        },
        '&[aria-expanded=true]': {
          borderBottom: 0,
        },
      },
    },
  },
  dropDownError: {
    borderColor: 'red !important',
  },
}));

export interface OptionProps {
  id?: string | number;
  name?: string;
  title?: string | number;
  value?: string | number | boolean;
  key?: string | number;
  prefixColor?: string;
  color?: string;
  type?: 'text' | 'number';
  placeholder?: string;
}

interface Props extends Omit<SelectProps, 'color'> {
  selectField?: 'title' | 'id' | 'value' | 'name' | 'key';
  styledDropdown?: string;
  fixedLabel?: boolean;
  errorType?: any; // FIXME
  // This is an object that can take any option for now
  options?: OptionProps[];
  // Any is passed here because no strict payload is defined.
  lookupFn?: () => Observable<ResponseModel<any>>;
  color?: Color;
}

export default function Select(props: Props) {
  const {
    name,
    label,
    value,
    defaultValue = '',
    error,
    onChange,
    onOpen = () => null,
    onClose,
    options,
    selectField = 'id',
    title = 'title',
    className,
    style,
    errorType,
    disabled,
    placeholder = '',
    fixedLabel = false,
    lookupFn,
    styledDropdown,
    color,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputProps,
    readOnly,
  } = props;

  const [labelProps, setLabelProps] = useState<InputLabelProps>({});
  const [_options, setOptions] = useState<OptionProps[]>();

  useEffect(() => {
    setLabelProps(fixedLabel ? { shrink: true } : {});
  }, [fixedLabel]);

  useEffect(() => {
    if (!lookupFn) {
      setOptions(options);
    }
  }, [options, lookupFn]);

  useEffect(() => {
    const destroyComponent$ = new Subject();
    if (lookupFn) {
      lookupFn()
        .pipe(takeUntil(destroyComponent$))
        .subscribe((res: any) => {
          const lookupOptions = res.map((item: any, index: number) => ({
            id: index,
            [title]: item[title],
            ...{ [selectField]: item[selectField] },
          }));
          setOptions(lookupOptions);
        });
    }
    return () => {
      destroyComponent$.next(true);
    };
  }, [lookupFn, selectField, title]);

  const getColorSelect = () => {
    if (color) {
      return color;
    }
    if (value) {
      return '';
    }
    return Color.GREY_LIGHTER;
  };

  const classes = useStyles();

  // INFO: solution for fix error : "provided an out-of-range value"
  // INFO: Show the select after component is render (this is workaround)
  const [isShow, setIsShow] = useState(false);
  useEffect(() => {
    setIsShow(true);
  }, []);
  return (
    // eslint-disable-next-line react/forbid-component-props
    <FormControl style={style} disabled={disabled} error={!!error}>
      {label && (
        <InputLabel {...labelProps} className={classes.label}>
          {label}
        </InputLabel>
      )}
      {isShow ? (
        <MuiSelect
          error={error}
          readOnly={readOnly}
          className={clsx(className, classes.select)}
          label={label}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onOpen={onOpen}
          onClose={onClose}
          // eslint-disable-next-line react/forbid-component-props
          style={{
            color: getColorSelect(),
          }}
          displayEmpty
          defaultValue={defaultValue}
          inputProps={{
            'data-testid': `select-${name}`,
          }}
          MenuProps={{
            getContentAnchorEl: null,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            classes: {
              paper: clsx(styledDropdown, { [classes.dropDownError]: error }),
            },
          }}
          disableUnderline
          IconComponent={KeyboardArrowDownIcon}
          data-testid={`muiSelect-${name}`}
        >
          {placeholder ? (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          ) : null}

          {_options &&
            // eslint-disable-next-line arrow-body-style
            _options.map((item) => {
              return (
                <MenuItem
                  key={item.id || item.name || item.title}
                  value={`${item[selectField]}`}
                  disabled={(item as any)?.disabled}
                  className={classes.menuItem}
                  // eslint-disable-next-line react/forbid-component-props
                  style={{ color: item.color }}
                  data-testid={`muiSelect-menuItem-${item.id}`}
                >
                  {item?.prefixColor && (
                    <div
                      className="prefix"
                      // eslint-disable-next-line react/forbid-dom-props
                      style={{
                        border: `1px solid ${item.prefixColor}`,
                        marginRight: '5px',
                        marginBottom: '2px',
                        height: '10px',
                        width: '10px',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                  <span className={classes.text}>{item.title}</span>
                </MenuItem>
              );
            })}
        </MuiSelect>
      ) : null}

      {error && <FormHelperText error={error}>{errorType}</FormHelperText>}
    </FormControl>
  );
}
